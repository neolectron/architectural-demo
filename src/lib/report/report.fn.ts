import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { Effect } from 'effect';
import { AppointmentService } from '#src/lib/appointment/appointment.service.ts';
import { CustomerService } from '#src/lib/customer/customer.service.ts';
import { runPromise } from '#src/lib/runtime/runtime.ts';

export const getDashboardSummary = createServerFn({ method: 'GET' }).handler(async () => {
  return runPromise(
    Effect.gen(function* () {
      const appointments = yield* AppointmentService;
      const customers = yield* CustomerService;

      const appointmentRows = yield* appointments.listAppointments();
      const customerRows = yield* customers.listCustomers;
      const activeCustomers = customerRows.filter((customer) => customer.status === 'active');
      const activeCustomerIds = new Set(activeCustomers.map((customer) => customer.id));
      const activeCustomerAppointments = appointmentRows.filter((appointment) =>
        activeCustomerIds.has(appointment.customerId),
      );

      return {
        customers: customerRows.length,
        activeCustomers: activeCustomers.length,
        appointments: appointmentRows.length,
        activeCustomerAppointments: activeCustomerAppointments.length,
        message:
          'This summary was orchestrated in report.fn.ts from AppointmentService and CustomerService.',
      };
    }),
  );
});

export const getDashboardHeader = createServerFn({ method: 'GET' }).handler(async () => {
  return runPromise(
    Effect.gen(function* () {
      const appointments = yield* AppointmentService;
      const customers = yield* CustomerService;

      const appointmentRows = yield* appointments.listAppointments();
      const customerRows = yield* customers.listCustomers;
      const activeCustomers = customerRows.filter((customer) => customer.status === 'active');
      const activeCustomerIds = new Set(activeCustomers.map((customer) => customer.id));
      const activeCustomerAppointments = appointmentRows.filter((appointment) =>
        activeCustomerIds.has(appointment.customerId),
      );

      return {
        title: `${activeCustomerAppointments.length} appointments for active customers`,
        subtitle: `${activeCustomers.length}/${customerRows.length} customers are active`,
      };
    }),
  );
});

export const reportKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  header: () => [...reportKeys.all, 'header'] as const,
};

export const reportQueries = {
  dashboard: () =>
    queryOptions({
      queryKey: reportKeys.dashboard(),
      queryFn: () => getDashboardSummary(),
    }),
  header: () =>
    queryOptions({
      queryKey: reportKeys.header(),
      queryFn: () => getDashboardHeader(),
    }),
};
