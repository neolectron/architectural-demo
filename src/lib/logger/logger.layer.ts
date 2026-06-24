import { Cause, Effect, Exit, Layer, Logger, Tracer } from 'effect';
import { TelemetryLayer } from '#src/lib/telemetry/telemetry.layer.ts';

const isDev = process.env.NODE_ENV === 'development';

const devColors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

const shouldLogEffectSpans =
  process.env.EFFECT_SPAN_LOGS === 'true' || (isDev && process.env.EFFECT_SPAN_LOGS !== 'false');

const makeEffectSpanLogPattern = () => {
  try {
    return new RegExp(process.env.EFFECT_SPAN_LOG_PATTERN ?? 'Service\\.');
  } catch {
    return /Service\./;
  }
};

const effectSpanLogPattern = makeEffectSpanLogPattern();
const shouldLogEffectSpanAttributes = process.env.EFFECT_SPAN_LOG_ATTRIBUTES === 'true';

export const withErrorLogging = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  self.pipe(
    Effect.tapErrorCause((cause) =>
      Cause.isInterruptedOnly(cause) ? Effect.void : Effect.logError(cause),
    ),
  );

const makeSpanLoggingTracer = (delegate: Tracer.Tracer): Tracer.Tracer =>
  Tracer.make({
    span(name, parent, spanContext, links, startTime, kind, options) {
      const span = delegate.span(name, parent, spanContext, links, startTime, kind, options);

      if (!effectSpanLogPattern.test(name)) return span;

      return {
        get _tag() {
          return span._tag;
        },
        get name() {
          return span.name;
        },
        get spanId() {
          return span.spanId;
        },
        get traceId() {
          return span.traceId;
        },
        get parent() {
          return span.parent;
        },
        get context() {
          return span.context;
        },
        get status() {
          return span.status;
        },
        get attributes() {
          return span.attributes;
        },
        get links() {
          return span.links;
        },
        get sampled() {
          return span.sampled;
        },
        get kind() {
          return span.kind;
        },
        end(endTime, exit) {
          span.end(endTime, exit);

          const durationMs = Number((endTime - startTime) / 1_000_000n);
          const status = Exit.isSuccess(exit) ? 'ok' : 'error';

          if (isDev) {
            const label = `${devColors.cyan}[${name}]${devColors.reset}`;
            const statusLabel =
              status === 'ok'
                ? `${devColors.green}OK${devColors.reset}`
                : `${devColors.red}ERROR${devColors.reset}`;
            const duration = `${devColors.dim}${durationMs}ms${devColors.reset}`;
            const message = `${label} ${statusLabel} ${duration}`;
            if (status === 'ok') console.debug(message);
            else console.error(message);
            return;
          }

          const log = {
            time: new Date().toISOString(),
            level: status === 'ok' ? 'DEBUG' : 'ERROR',
            message: 'effect span completed',
            span: name,
            status,
            durationMs,
            traceId: span.traceId,
            spanId: span.spanId,
            ...(shouldLogEffectSpanAttributes
              ? { attributes: Object.fromEntries(span.attributes) }
              : {}),
          };

          if (status === 'ok') console.debug(JSON.stringify(log));
          else console.error(JSON.stringify(log));
        },
        attribute(key, value) {
          span.attribute(key, value);
        },
        event(eventName, eventStartTime, attributes) {
          span.event(eventName, eventStartTime, attributes);
        },
        addLinks(newLinks) {
          span.addLinks(newLinks);
        },
      };
    },
    context: delegate.context,
  });

export const withEffectSpanLogging = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  shouldLogEffectSpans
    ? Effect.tracerWith((tracer) => effect.pipe(Effect.withTracer(makeSpanLoggingTracer(tracer))))
    : effect;

const LoggerLayer = isDev
  ? Logger.pretty
  : Logger.replace(Logger.defaultLogger, Logger.withLeveledConsole(Logger.stringLogger));

export const ObservabilityLayer = Layer.merge(TelemetryLayer, LoggerLayer);
