package main

import (
	"bufio"
	"net"
	"strings"
	"testing"
	"time"

	labdocker "github.com/cyberforce/orchestrator/pkg/docker"
)

func TestGuacdHandshakeUsesServerSelectedVNC(t *testing.T) {
	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()
	completed := make(chan error, 1)
	go func() {
		reader := bufio.NewReader(server)
		selectMessage, err := readInstruction(reader)
		if err != nil {
			completed <- err
			return
		}
		if strings.Join(selectMessage, ",") != "select,vnc" {
			completed <- net.InvalidAddrError("unexpected protocol selection")
			return
		}
		_, err = server.Write([]byte(instruction("args", "VERSION_1_5_0", "hostname", "port", "password", "read-only")))
		if err != nil {
			completed <- err
			return
		}
		for i := 0; i < 6; i++ {
			message, readErr := readInstruction(reader)
			if readErr != nil {
				completed <- readErr
				return
			}
			if i == 5 && strings.Join(message, ",") != "connect,VERSION_1_5_0,100.64.0.4,5900,testpass," {
				completed <- net.InvalidAddrError("connection arguments were not server-selected")
				return
			}
		}
		_, err = server.Write([]byte(instruction("ready", "session-id")))
		completed <- err
	}()
	_, ready, err := guacdHandshake(client, labdocker.AttackBoxConnection{IP: "100.64.0.4", Password: "testpass"})
	if err != nil {
		t.Fatal(err)
	}
	if ready != instruction("ready", "session-id") {
		t.Fatalf("unexpected ready instruction: %s", ready)
	}
	select {
	case err := <-completed:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(time.Second):
		t.Fatal("guacd handshake timed out")
	}
}

func TestGuacamoleInstructionsHandleUnicodeAndRejectMalformedInput(t *testing.T) {
	encoded := instruction("clipboard", "cờ động")
	parts, err := readInstruction(bufio.NewReader(strings.NewReader(encoded)))
	if err != nil || strings.Join(parts, ",") != "clipboard,cờ động" {
		t.Fatalf("round trip failed: %v %v", parts, err)
	}
	if _, err := readInstruction(bufio.NewReader(strings.NewReader("6.select,3.vnc"))); err == nil {
		t.Fatal("malformed instruction accepted")
	}
	if clientInstructions["select"] || clientInstructions["connect"] || !clientInstructions["clipboard"] {
		t.Fatal("unsafe client instruction allowlist")
	}
}

func TestGuacamoleResizeIsBounded(t *testing.T) {
	for _, parts := range [][]string{
		{"size", "640", "480", "96"},
		{"size", "1920", "1080", "96"},
	} {
		if !validClientInstruction(parts) {
			t.Fatalf("valid size rejected: %v", parts)
		}
	}
	for _, parts := range [][]string{
		{"size", "32768", "32768", "96"},
		{"size", "640", "480", "0"},
		{"size", "invalid", "480", "96"},
		{"size", "640", "480"},
		{"select", "vnc"},
	} {
		if validClientInstruction(parts) {
			t.Fatalf("unsafe size instruction accepted: %v", parts)
		}
	}
}
