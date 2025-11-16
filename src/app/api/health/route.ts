import { NextResponse } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

/**
 * Health check endpoint that includes circuit breaker status
 * GET /api/health
 */
export async function GET() {
  try {
    // Get circuit breaker status
    const circuitBreakerStatus = kubeClient.getCircuitBreakerStatus();

    // Determine overall health based on circuit breaker state
    const isHealthy = circuitBreakerStatus.state !== 'open';

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        circuitBreaker: {
          state: circuitBreakerStatus.state,
          failureRate: circuitBreakerStatus.failureRate,
          requestCount: circuitBreakerStatus.requestCount,
          remainingTimeout: circuitBreakerStatus.remainingTimeout,
        },
        kubernetes: {
          connected: circuitBreakerStatus.state === 'closed',
        },
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
