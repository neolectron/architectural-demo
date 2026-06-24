import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { Effect } from 'effect';
import { CustomerService } from './customer.service.ts';
import { runPromise } from '#src/lib/runtime/runtime.ts';

export const getCustomers = createServerFn({ method: 'GET' }).handler(async () => {
  return runPromise(
    Effect.gen(function* () {
      const customers = yield* CustomerService;
      return yield* customers.listCustomers;
    }),
  );
});

export const customerKeys = {
  all: ['customers'] as const,
  list: () => [...customerKeys.all, 'list'] as const,
};

export const customerQueries = {
  list: () =>
    queryOptions({
      queryKey: customerKeys.list(),
      queryFn: () => getCustomers(),
    }),
};
