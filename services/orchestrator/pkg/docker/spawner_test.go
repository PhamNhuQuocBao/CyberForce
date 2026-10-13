package docker

import (
	"net/netip"
	"testing"
)

func TestSandboxPolicy(t *testing.T) {
	id := "11111111-1111-4111-8111-111111111111"
	for i := uint32(0); i < 32; i++ {
		prefix := netip.MustParsePrefix(subnet(id, i))
		if prefix.Bits() != 29 || !netip.MustParsePrefix("100.64.0.0/10").Contains(prefix.Addr()) {
			t.Fatalf("subnet outside lab range: %s", prefix)
		}
	}
	containerConfig, hostConfig, networkingConfig := config("cyberforce/test:v1", id, "cf-lab-net-test")
	if containerConfig.Image != "cyberforce/test:v1" || hostConfig.Resources.NanoCPUs != 2_000_000_000 || hostConfig.Resources.Memory != 2*1024*1024*1024 || hostConfig.Resources.MemorySwap != hostConfig.Resources.Memory || *hostConfig.Resources.PidsLimit != 512 {
		t.Fatal("lab resource policy changed")
	}
	if len(hostConfig.CapDrop) != 1 || hostConfig.CapDrop[0] != "ALL" || hostConfig.Privileged || len(hostConfig.Binds) != 0 || len(hostConfig.PortBindings) != 0 {
		t.Fatal("lab privilege policy changed")
	}
	if _, ok := networkingConfig.EndpointsConfig["cf-lab-net-test"]; !ok {
		t.Fatal("lab is not attached to isolated network")
	}
}
