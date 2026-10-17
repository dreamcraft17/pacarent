import type { ReactNode } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, children, className = '' }: Props) {
  return (
    <section className={`v3-panel ${className}`.trim()}>
      {title && <h2 className="v3-panel-title">{title}</h2>}
      {children}
    </section>
  );
}
