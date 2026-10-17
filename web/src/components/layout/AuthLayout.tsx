import type { ReactNode } from 'react';

type Props = {
  kicker?: string;
  title: string;
  lead: string;
  bullets: string[];
  children: ReactNode;
};

export default function AuthLayout({ kicker, title, lead, bullets, children }: Props) {
  return (
    <div className="v3-auth">
      <aside className="v3-auth-aside" aria-label="Manfaat akun">
        {kicker && <p className="v3-kicker">{kicker}</p>}
        <h2>{title}</h2>
        <p className="v3-auth-lead">{lead}</p>
        <ul>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </aside>
      <div className="v3-auth-main">{children}</div>
    </div>
  );
}
