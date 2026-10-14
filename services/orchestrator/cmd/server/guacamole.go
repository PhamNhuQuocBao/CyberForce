package main

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	labdocker "github.com/cyberforce/orchestrator/pkg/docker"
	"github.com/gorilla/websocket"
)

type attackBoxManager interface {
	StartAttackBox(context.Context, string) (labdocker.AttackBox, error)
	StopAttackBox(context.Context, string) error
	AttackBoxStatus(context.Context, string) (labdocker.AttackBox, error)
	OpenAttackBox(context.Context, string) (labdocker.AttackBoxConnection, error)
}

func instruction(parts ...string) string {
	encoded := make([]string, 0, len(parts))
	for _, part := range parts {
		encoded = append(encoded, strconv.Itoa(utf8.RuneCountInString(part))+"."+part)
	}
	return strings.Join(encoded, ",") + ";"
}

func readInstruction(reader *bufio.Reader) ([]string, error) {
	parts := make([]string, 0, 8)
	for len(parts) < 128 {
		length := 0
		for {
			r, _, err := reader.ReadRune()
			if err != nil {
				return nil, err
			}
			if r == '.' {
				break
			}
			if r < '0' || r > '9' || length > 65536 {
				return nil, errors.New("invalid Guacamole element length")
			}
			length = length*10 + int(r-'0')
		}
		if length > 65536 {
			return nil, errors.New("Guacamole element too large")
		}
		var value strings.Builder
		for i := 0; i < length; i++ {
			r, _, err := reader.ReadRune()
			if err != nil {
				return nil, err
			}
			value.WriteRune(r)
		}
		parts = append(parts, value.String())
		separator, _, err := reader.ReadRune()
		if err != nil {
			return nil, err
		}
		if separator == ';' {
			return parts, nil
		}
		if separator != ',' {
			return nil, errors.New("invalid Guacamole separator")
		}
	}
	return nil, errors.New("too many Guacamole elements")
}

func guacdHandshake(conn net.Conn, target labdocker.AttackBoxConnection) (*bufio.Reader, string, error) {
	_ = conn.SetDeadline(time.Now().Add(15 * time.Second))
	if _, err := io.WriteString(conn, instruction("select", "vnc")); err != nil {
		return nil, "", err
	}
	reader := bufio.NewReader(conn)
	args, err := readInstruction(reader)
	if err != nil {
		return nil, "", err
	}
	if len(args) < 2 || args[0] != "args" {
		return nil, "", errors.New("guacd did not return VNC arguments")
	}
	values := []string{"connect"}
	for _, name := range args[1:] {
		switch {
		case strings.HasPrefix(name, "VERSION_"):
			values = append(values, name)
		case name == "hostname":
			values = append(values, target.IP)
		case name == "port":
			values = append(values, "5900")
		case name == "password":
			values = append(values, target.Password)
		case name == "color-depth":
			values = append(values, "24")
		default:
			values = append(values, "")
		}
	}
	negotiation := instruction("size", "1280", "800", "96") +
		instruction("audio") + instruction("video") +
		instruction("image", "image/png", "image/jpeg") +
		instruction("timezone", "UTC") + instruction(values...)
	if _, err := io.WriteString(conn, negotiation); err != nil {
		return nil, "", err
	}
	ready, err := readInstruction(reader)
	if err != nil {
		return nil, "", err
	}
	if len(ready) < 2 || ready[0] != "ready" {
		return nil, "", fmt.Errorf("guacd VNC connection failed: %v", ready)
	}
	_ = conn.SetDeadline(time.Time{})
	return reader, instruction(ready...), nil
}

var clientInstructions = map[string]bool{
	"nop": true, "sync": true, "key": true, "mouse": true, "size": true,
	"clipboard": true, "blob": true, "end": true, "ack": true,
}

func validClientInstruction(parts []string) bool {
	if len(parts) == 0 || !clientInstructions[parts[0]] {
		return false
	}
	if parts[0] != "size" {
		return true
	}
	if len(parts) != 4 {
		return false
	}
	width, widthErr := strconv.Atoi(parts[1])
	height, heightErr := strconv.Atoi(parts[2])
	dpi, dpiErr := strconv.Atoi(parts[3])
	return widthErr == nil && heightErr == nil && dpiErr == nil &&
		width >= 640 && width <= 1920 && height >= 480 && height <= 1080 &&
		dpi >= 72 && dpi <= 192
}

func serveAttackBox(w http.ResponseWriter, r *http.Request, manager attackBoxManager, id string) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	target, err := manager.OpenAttackBox(ctx, id)
	cancel()
	if err != nil {
		http.Error(w, "attackbox unavailable", http.StatusBadGateway)
		return
	}
	address := os.Getenv("GUACD_ADDRESS")
	if address == "" {
		address = "guacd:4822"
	}
	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		http.Error(w, "guacd unavailable", http.StatusBadGateway)
		return
	}
	defer conn.Close()
	reader, ready, err := guacdHandshake(conn, target)
	if err != nil {
		http.Error(w, "attackbox desktop unavailable", http.StatusBadGateway)
		return
	}
	ws, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return r.Header.Get("Origin") == "" }}).Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer ws.Close()
	ws.SetReadLimit(1024 * 1024)
	if err := ws.WriteMessage(websocket.TextMessage, []byte(ready)); err != nil {
		return
	}
	done := make(chan struct{})
	go func() {
		defer close(done)
		defer ws.Close()
		buffer := make([]byte, 16*1024)
		for {
			n, err := reader.Read(buffer)
			if n > 0 {
				if writeErr := ws.WriteMessage(websocket.TextMessage, buffer[:n]); writeErr != nil {
					return
				}
			}
			if err != nil {
				return
			}
		}
	}()
	_ = ws.SetReadDeadline(time.Now().Add(15 * time.Minute))
	for {
		kind, data, err := ws.ReadMessage()
		if err != nil {
			break
		}
		if kind != websocket.TextMessage {
			break
		}
		source := bytes.NewReader(data)
		input := bufio.NewReader(source)
		valid := true
		for source.Len()+input.Buffered() > 0 {
			parts, err := readInstruction(input)
			if err != nil || !validClientInstruction(parts) {
				valid = false
				break
			}
			if _, err := io.WriteString(conn, instruction(parts...)); err != nil {
				valid = false
				break
			}
		}
		if !valid {
			break
		}
		_ = ws.SetReadDeadline(time.Now().Add(15 * time.Minute))
	}
	_ = conn.Close()
	select {
	case <-done:
	case <-time.After(time.Second):
	}
}
