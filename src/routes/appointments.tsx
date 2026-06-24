import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { appointmentMutations, appointmentQueries } from '#src/lib/appointment/appointment.fn.ts';

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { data } = useSuspenseQuery(appointmentQueries.list());
  const create = useMutation(appointmentMutations.create());

  return (
    <section>
      <h1>Appointments</h1>
      <button type="button" onClick={() => create.mutate('Demo appointment')}>
        Create dummy appointment
      </button>
      {create.data ? <p>Created: {create.data.title}</p> : null}
      {data.map((appointment) => (
        <div key={appointment.id} className="card">
          <strong>{appointment.title}</strong>
          <p>Status: {appointment.status}</p>
        </div>
      ))}
    </section>
  );
}
