import { Effect } from 'effect';

export class AppointmentService extends Effect.Service<AppointmentService>()('AppointmentService', {
  effect: Effect.gen(function* () {
    yield* Effect.void;

    return {
      listAppointments: Effect.fn('AppointmentService.listAppointments')(function* () {
        yield* Effect.void;

        return [
          {
            id: 'apt_1',
            customerId: 'cus_1',
            title: 'Intro call',
            status: 'booked' as const,
          },
          {
            id: 'apt_2',
            customerId: 'cus_2',
            title: 'Follow-up',
            status: 'valid' as const,
          },
        ];
      }),

      createAppointment: Effect.fn('AppointmentService.createAppointment')(function* (
        title: string,
      ) {
        yield* Effect.void;
        return {
          id: `apt_${Date.now()}`,
          title,
          status: 'booked' as const,
        };
      }),
    };
  }),
}) {}
