import { context, trace } from '@opentelemetry/api';
import { Effect, Layer, ManagedRuntime, Tracer } from 'effect';
import { AppointmentService } from '#src/lib/appointment/appointment.service.ts';
import { CustomerService } from '#src/lib/customer/customer.service.ts';
import {
  ObservabilityLayer,
  withEffectSpanLogging,
  withErrorLogging,
} from '#src/lib/logger/logger.layer.ts';

const AppLayer = Layer.mergeAll(CustomerService.Default, AppointmentService.Default);

const AppRuntime = ManagedRuntime.make(AppLayer.pipe(Layer.provideMerge(ObservabilityLayer)));

type AppRuntimeContext = ManagedRuntime.ManagedRuntime.Context<typeof AppRuntime>;

const withParentSpanFromContext = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => {
  const currentSpan = trace.getSpan(context.active());
  if (!currentSpan) return effect;

  const spanContext = currentSpan.spanContext();
  return effect.pipe(
    Effect.withParentSpan(
      Tracer.externalSpan({
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        sampled: (spanContext.traceFlags & 1) === 1,
      }),
    ),
  );
};

export const runPromise = <A, E>(effect: Effect.Effect<A, E, AppRuntimeContext>) =>
  AppRuntime.runPromise(
    effect.pipe(withParentSpanFromContext, withEffectSpanLogging, withErrorLogging),
  );
