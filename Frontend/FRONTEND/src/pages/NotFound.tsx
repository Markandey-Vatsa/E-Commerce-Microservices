import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="font-display text-[120px] font-bold leading-none text-brand">4<span className="text-sun">0</span>4</p>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-subtle">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
