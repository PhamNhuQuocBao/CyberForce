package main

import (
	"errors"
	"fmt"
	"log"
	"net/netip"
	"reflect"
	"sort"
	"time"
)

type accessGrant struct {
	UserID    string    `json:"userId"`
	PeerIP    string    `json:"peerIp"`
	TargetIP  string    `json:"targetIp"`
	TargetIPs []string  `json:"targetIps,omitempty"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func validGrant(id string, grant accessGrant, peers map[string]peer) bool {
	peerIP, peerErr := netip.ParseAddr(grant.PeerIP)
	maxDuration := 5 * time.Hour
	if len(grant.TargetIPs) > 0 {
		maxDuration = 25 * time.Hour
	}
	if !userIDRule.MatchString(id) || !userIDRule.MatchString(grant.UserID) || peerErr != nil || !peerIP.Is4() || !vpnRange.Contains(peerIP) || peers[grant.UserID].Address != grant.PeerIP || !grant.ExpiresAt.After(time.Now()) || !grant.ExpiresAt.Before(time.Now().Add(maxDuration)) {
		return false
	}
	targets := grant.TargetIPs
	if len(targets) == 0 {
		targets = []string{grant.TargetIP}
	}
	if len(targets) == 0 || len(targets) > 4 {
		return false
	}
	seen := map[string]bool{}
	for _, raw := range targets {
		targetIP, err := netip.ParseAddr(raw)
		if err != nil || !targetIP.Is4() || !netip.MustParsePrefix("100.64.0.0/10").Contains(targetIP) || vpnRange.Contains(targetIP) || seen[raw] {
			return false
		}
		seen[raw] = true
	}
	return true
}

func grantTargets(grant accessGrant) []string {
	if len(grant.TargetIPs) > 0 {
		return grant.TargetIPs
	}
	return []string{grant.TargetIP}
}

func (c *controller) applyAccess() (result error) {
	defer func() {
		if result != nil {
			_ = c.run("ip", "link", "set", "down", "dev", interfaceName)
		}
	}()
	if err := c.run("iptables", "-F", "CF_VPN_FORWARD"); err != nil {
		return err
	}
	if err := c.run("iptables", "-t", "nat", "-F", "CF_VPN_SNAT"); err != nil {
		return err
	}
	ids := make([]string, 0, len(c.access))
	for id := range c.access {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		grant := c.access[id]
		if !validGrant(id, grant, c.peers) {
			continue
		}
		for _, targetIP := range grantTargets(grant) {
			if err := c.run("iptables", "-A", "CF_VPN_FORWARD", "-i", "wg0", "-s", grant.PeerIP,
				"-d", targetIP, "-j", "ACCEPT"); err != nil {
				return err
			}
			if err := c.run("iptables", "-A", "CF_VPN_FORWARD", "-o", "wg0", "-s", targetIP,
				"-d", grant.PeerIP, "-m", "conntrack", "--ctstate", "ESTABLISHED,RELATED", "-j", "ACCEPT"); err != nil {
				return err
			}
			if err := c.run("iptables", "-t", "nat", "-A", "CF_VPN_SNAT", "-s", grant.PeerIP,
				"-d", targetIP, "-j", "MASQUERADE"); err != nil {
				return err
			}
		}
	}
	if err := c.run("iptables", "-A", "CF_VPN_FORWARD", "-m", "limit", "--limit", "6/min", "--limit-burst", "10", "-j", "LOG", "--log-prefix", "CF_VPN_BLOCKED "); err != nil {
		return err
	}
	return c.run("iptables", "-A", "CF_VPN_FORWARD", "-j", "DROP")
}

func (c *controller) putAccess(id string, grant accessGrant) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if !validGrant(id, grant, c.peers) {
		return errors.New("invalid VPN access grant")
	}
	for otherID, other := range c.access {
		if otherID != id && (other.PeerIP == grant.PeerIP || targetsOverlap(grantTargets(other), grantTargets(grant))) {
			return errors.New("peer or target already assigned")
		}
	}
	previous, existed := c.access[id]
	if existed && reflect.DeepEqual(previous, grant) {
		return nil
	}
	c.access[id] = grant
	if err := c.applyAccess(); err != nil {
		if existed {
			c.access[id] = previous
		} else {
			delete(c.access, id)
		}
		_ = c.applyAccess()
		return fmt.Errorf("apply access: %w", err)
	}
	return nil
}

func targetsOverlap(a, b []string) bool {
	for _, x := range a {
		for _, y := range b {
			if x == y {
				return true
			}
		}
	}
	return false
}

func (c *controller) deleteAccess(id string) error {
	if !userIDRule.MatchString(id) {
		return errors.New("invalid instance ID")
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	previous, exists := c.access[id]
	if !exists {
		return nil
	}
	delete(c.access, id)
	if err := c.applyAccess(); err != nil {
		c.access[id] = previous
		_ = c.applyAccess()
		return err
	}
	return nil
}

func (c *controller) expireAccess() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		c.mu.Lock()
		changed := false
		for id, grant := range c.access {
			if !validGrant(id, grant, c.peers) {
				delete(c.access, id)
				changed = true
			}
		}
		if changed {
			if err := c.applyAccess(); err != nil {
				log.Printf("expire VPN access: %v", err)
			}
		}
		c.mu.Unlock()
	}
}
