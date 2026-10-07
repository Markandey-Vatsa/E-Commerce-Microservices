import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/orderApi';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { OrderCard } from '../../components/OrderCard';
import { Alert, EmptyState, ErrorState, ListSkeleton, PageHeader } from '../../components/ui';

/** Shown when the JWT carries no numeric user id. This is a backend-contract limitation, not something to work around. */
export function UserIdLimitation() {
  return (
    <Alert kind="error">
      <p className="font-medium">We cannot identify your account for orders yet.</p>
      <p className="mt-1">The order endpoints take a numeric <code>userId</code>, but your login token does not include one and the backend has no endpoint to look it up. Add a <code>userId</code> claim to the JWT (or provide a profile endpoint) to enable ordering.</p>
    </Alert>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const uid = user?.userId ?? null;
  const { data, loading, error, reload } = useAsync(() => (uid == null ? Promise.resolve([]) : getMyOrders(uid)), [uid]);
  return (
    <div className="container-page py-10">
      <PageHeader title={user?.role === 'CUSTOMER' ? 'My orders' : 'Orders'} sub={user?.role === 'CUSTOMER' ? undefined : 'Orders placed with this account.'} />
      {uid == null ? <UserIdLimitation /> : loading ? <ListSkeleton /> : error ? <ErrorState error={error} onRetry={reload} /> : !data?.length ? (
        <EmptyState title="You haven't placed any orders yet." action={<Link to="/products" className="btn-primary">Browse products</Link>} />
      ) : <div className="space-y-3">{data.map((o, i) => <OrderCard key={String(o.id ?? o.orderId ?? i)} order={o} />)}</div>}
    </div>
  );
}
