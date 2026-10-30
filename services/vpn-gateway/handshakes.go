package main

import (
	"strconv"
	"strings"
	"time"
)

func parseHandshakes(output []byte) map[string]int64 {
	result := make(map[string]int64)
	for _, line := range strings.Split(strings.TrimSpace(string(output)), "\n") {
		fields := strings.Fields(line)
		if len(fields) != 2 || !validKey(fields[0]) {
			continue
		}
		value, err := strconv.ParseInt(fields[1], 10, 64)
		if err == nil && value >= 0 {
			result[fields[0]] = value
		}
	}
	return result
}

func (c *controller) sampleHandshakes() {
	output, err := c.readHandshakes()
	c.mu.Lock()
	defer c.mu.Unlock()
	c.sampleError = err != nil
	if err == nil {
		c.handshakes = parseHandshakes(output)
		c.sampledAt = time.Now()
	}
}

func (c *controller) pollHandshakes() {
	c.sampleHandshakes()
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for range ticker.C {
		c.sampleHandshakes()
	}
}
