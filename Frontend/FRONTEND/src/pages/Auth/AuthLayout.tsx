import type { ReactNode } from 'react';
export function AuthLayout({ title, sub, children, footer }: { title: string; sub?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-sm text-subtle">{sub}</p>}
        <div className="panel mt-7 p-7 shadow-[0_24px_50px_-30px_rgba(70,55,212,.45)]">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-subtle">{footer}</div>}
      </div>
    </div>
  );
}
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
