import { createServerFn } from '@tanstack/react-start';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { Effect } from 'effect';
import { AppointmentService } from './appointment.service.ts';
import { runPromise } from '#src/lib/runtime/runtime.ts';

export const getAppointments = createServerFn({ method: 'GET' }).handler(async () => {
  return runPromise(
    Effect.gen(function* () {
      const appointments = yield* AppointmentService;
      return yield* appointments.listAppointments();
    }),
  );
});

export const createAppointment = createServerFn({ method: 'POST' })
  .inputValidator((data) => String(data))
  .handler(async ({ data }) => {
    return runPromise(
      Effect.gen(function* () {
        const appointments = yield* AppointmentService;
        return yield* appointments.createAppointment(data);
      }),
    );
  });

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: () => [...appointmentKeys.all, 'list'] as const,
};

export const appointmentQueries = {
  list: () =>
    queryOptions({
      queryKey: appointmentKeys.list(),
      queryFn: () => getAppointments(),
    }),
};

export const appointmentMutations = {
  create: () =>
    mutationOptions({
      mutationKey: [...appointmentKeys.all, 'create'] as const,
      mutationFn: (title: string) => createAppointment({ data: title }),
    }),
};
