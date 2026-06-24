import { Effect } from 'effect';

export class CustomerService extends Effect.Service<CustomerService>()('CustomerService', {
  effect: Effect.gen(function* () {
    yield* Effect.void;

    return {
      listCustomers: Effect.succeed([
        { id: 'cus_1', name: 'Acme Corp', status: 'active' as const },
        { id: 'cus_2', name: 'Globex', status: 'paused' as const },
      ]).pipe(Effect.withSpan('CustomerService.listCustomers')),

      customerHealth: Effect.fn('CustomerService.customerHealth')(function* (customerId: string) {
        yield* Effect.annotateCurrentSpan('customerId', customerId);
        return { customerId, score: 92 };
      }),
    };
  }),
}) {}
