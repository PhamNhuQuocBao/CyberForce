/**
 * CyberForce Core API Service
 * Entry point for authentication, LMS, and CTF services.
 */

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
}

export function getHealthStatus(): SystemHealthStatus {
  return {
    status: 'healthy',
    service: '@cyberforce/api-core',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  };
}

console.info('CyberForce API Core initialized:', getHealthStatus());
