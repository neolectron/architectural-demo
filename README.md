# Server Function + Effect Leak Repro Shell

This package is a small, functional TanStack Start app that mirrors the relevant shape of `geos`:

- `*.service.ts` files define flat Effect services.
- `*.fn.ts` files define TanStack server functions plus React Query factories/mutations.
- `report.fn.ts` intentionally composes multiple services directly inside server-function handlers.
- React routes call those query factories with `useSuspenseQuery`/`useMutation`.
- `logger.layer.ts` mirrors Effect service/method span completions to logs.
- `telemetry.layer.ts` optionally exports Effect spans/logs to OpenTelemetry with `OTEL_EXPORTER_OTLP_ENDPOINT`.

Run it with:

```sh
pnpm dev
```

Then open `http://localhost:3010`.

By default in development, Effect spans whose names match `Service\.` are logged. You can tune this with:

```sh
EFFECT_SPAN_LOGS=false pnpm dev
EFFECT_SPAN_LOG_PATTERN='AppointmentService|CustomerService' pnpm dev
EFFECT_SPAN_LOG_ATTRIBUTES=true pnpm dev
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 pnpm dev
```

## Demonstration Idea

The app works because server-only Effect service composition stays inside `createServerFn(...).handler(...)`.

The most realistic demo is `src/lib/report/report.fn.ts`: both `getDashboardSummary` and `getDashboardHeader` repeat the same orchestration:

- load `AppointmentService`
- load `CustomerService`
- fetch appointments and customers
- compute active customers
- filter appointments down to appointments belonging to active customers

It is tempting to extract that repeated orchestration into an exported helper above the server functions, for example `loadDashboardModel()`. That helper would look like normal backend application logic, but it would live in a `*.fn.ts` file that frontend code imports for `reportQueries`.

That exported helper becomes part of the client-importable `*.fn.ts` module surface, while it still imports `runPromise`, `Effect`, and backend service modules.

The point is to show how a working architecture can accidentally leak backend code into frontend code when server-only logic is lifted out of the server-function handler and exported from the same file that frontend route code imports for query factories.
