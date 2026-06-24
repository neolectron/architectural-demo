import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { reportQueries } from '#src/lib/report/report.fn.ts';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useSuspenseQuery(reportQueries.dashboard());
  const { data: header } = useSuspenseQuery(reportQueries.header());

  return (
    <section>
      <h1>Tanstack Server Functions patterns</h1>
      <div className="card">
        <h2>{header.title}</h2>
        <p>{header.subtitle}</p>
        <p>{data.message}</p>
        <p>Customers: {data.customers}</p>
        <p>Active customers: {data.activeCustomers}</p>
        <p>Appointments: {data.appointments}</p>
        <p>Appointments for active customers: {data.activeCustomerAppointments}</p>
      </div>
    </section>
  );
}
