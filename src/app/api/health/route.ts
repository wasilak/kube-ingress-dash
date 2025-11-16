import { NextResponse } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
import { HTTP_STATUS } from '@/constants/http';
import { KUBERNETES_TIMEOUTS } from '@/constants/kubernetes';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

/**
 * Health check result interface
 */
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    kubernetes: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

/**
 * Health check endpoint with Kubernetes API connectivity check
 * GET /api/health
 *
 * Performs a lightweight connectivity check to the Kubernetes API by listing namespaces.
 * Returns HTTP 200 when healthy, HTTP 503 when unhealthy.
 * Includes latency metrics and has a 5-second timeout.
 *
 * @returns {Promise<Response>} Health check response with status and metrics
 */
export async function GET(): Promise<Response> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Perform Kubernetes API connectivity check with 5-second timeout
    const connectivityCheck = await Promise.race([
      checkKubernetesConnectivity(),
      timeoutPromise(KUBERNETES_TIMEOUTS.HEALTH_CHECK_TIMEOUT),
    ]);

    const latency = Date.now() - startTime;

    if (connectivityCheck.status === 'up') {
      const result: HealthCheckResult = {
        status: 'healthy',
        timestamp,
        checks: {
          kubernetes: {
            status: 'up',
            latency,
          },
        },
      };

      return NextResponse.json(result, { status: HTTP_STATUS.OK });
    } else {
      const result: HealthCheckResult = {
        status: 'unhealthy',
        timestamp,
        checks: {
          kubernetes: {
            status: 'down',
            latency,
            error: connectivityCheck.error,
          },
        },
      };

      return NextResponse.json(result, { status: HTTP_STATUS.SERVICE_UNAVAILABLE });
    }
  } catch (error) {
    const latency = Date.now() - startTime;

    // Handle timeout or other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const result: HealthCheckResult = {
      status: 'unhealthy',
      timestamp,
      checks: {
        kubernetes: {
          status: 'down',
          latency,
          error: errorMessage,
        },
      },
    };

    return NextResponse.json(result, { status: HTTP_STATUS.SERVICE_UNAVAILABLE });
  }
}

/**
 * Check Kubernetes API connectivity by listing namespaces
 * This is a lightweight operation suitable for health checks
 *
 * @returns {Promise<{status: 'up' | 'down', error?: string}>} Connectivity status
 */
async function checkKubernetesConnectivity(): Promise<{ status: 'up' | 'down'; error?: string }> {
  try {
    // Attempt to list namespaces as a connectivity check
    await kubeClient.getNamespaces();
    return { status: 'up' };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to connect to Kubernetes API';
    return {
      status: 'down',
      error: errorMessage,
    };
  }
}

/**
 * Create a promise that rejects after the specified timeout
 *
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise<never>} Promise that rejects on timeout
 */
function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Health check timeout after ${ms}ms`));
    }, ms);
  });
}
