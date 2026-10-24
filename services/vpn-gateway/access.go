package main

import (
	"errors"
	"fmt"
	"log"
	"net/netip"
	"sort"
	"time"
)

type accessGrant struct {
	UserID    string    `json:"userId"`
	PeerIP    string    `json:"peerIp"`
	TargetIP  string    `json:"targetIp"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func validGrant(id string, grant accessGrant, peers map[string]peer) bool {
	peerIP, peerErr := netip.ParseAddr(grant.PeerIP)
	targetIP, targetErr := netip.ParseAddr(grant.TargetIP)
	return userIDRule.MatchString(id) && userIDRule.MatchString(grant.UserID) &&
		peerErr == nil && targetErr == nil && peerIP.Is4() && targetIP.Is4() &&
		vpnRange.Contains(peerIP) && netip.MustParsePrefix("100.64.0.0/10").Contains(targetIP) &&
		!vpnRange.Contains(targetIP) && peers[grant.UserID].Address == grant.PeerIP &&
		grant.ExpiresAt.After(time.Now()) && grant.ExpiresAt.Before(time.Now().Add(5*time.Hour))
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
		if err := c.run("iptables", "-A", "CF_VPN_FORWARD", "-i", "wg0", "-s", grant.PeerIP,
			"-d", grant.TargetIP, "-j", "ACCEPT"); err != nil {
			return err
		}
		if err := c.run("iptables", "-A", "CF_VPN_FORWARD", "-o", "wg0", "-s", grant.TargetIP,
			"-d", grant.PeerIP, "-m", "conntrack", "--ctstate", "ESTABLISHED,RELATED", "-j", "ACCEPT"); err != nil {
			return err
		}
		if err := c.run("iptables", "-t", "nat", "-A", "CF_VPN_SNAT", "-s", grant.PeerIP,
			"-d", grant.TargetIP, "-j", "MASQUERADE"); err != nil {
			return err
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
		if otherID != id && (other.PeerIP == grant.PeerIP || other.TargetIP == grant.TargetIP) {
			return errors.New("peer or target already assigned")
		}
	}
	previous, existed := c.access[id]
	if existed && previous == grant {
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
