import * as Otlp from '@effect/opentelemetry/Otlp';
import { NodeHttpClient } from '@effect/platform-node';
import { Effect, Layer } from 'effect';

const parseHeaders = (value: string | undefined): Record<string, string> | undefined => {
  if (!value) return undefined;

  const headers: Record<string, string> = {};
  for (const pair of value.split(',')) {
    const [key, ...valueParts] = pair.split('=');
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join('=').trim();
    }
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
};

export const TelemetryLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    if (!endpoint) {
      yield* Effect.logInfo('[otel] Disabled (OTEL_EXPORTER_OTLP_ENDPOINT required)');
      return Layer.empty;
    }

    const serviceName = process.env.OTEL_SERVICE_NAME ?? 'architectural-demo';
    const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? '1.0.0';

    yield* Effect.logInfo(`[otel] Starting for ${serviceName} -> ${endpoint}`);

    return Otlp.layerJson({
      baseUrl: endpoint,
      resource: {
        serviceName,
        serviceVersion,
        attributes: {
          'deployment.environment.name': process.env.NODE_ENV ?? 'development',
        },
      },
      headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    }).pipe(Layer.provide(NodeHttpClient.layerUndici));
  }),
);
