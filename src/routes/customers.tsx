import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { customerQueries } from '#src/lib/customer/customer.fn.ts';

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
});

function CustomersPage() {
  const { data } = useSuspenseQuery(customerQueries.list());

  return (
    <section>
      <h1>Customers</h1>
      {data.map((customer) => (
        <div key={customer.id} className="card">
          <strong>{customer.name}</strong>
          <p>Status: {customer.status}</p>
        </div>
      ))}
    </section>
  );
}
