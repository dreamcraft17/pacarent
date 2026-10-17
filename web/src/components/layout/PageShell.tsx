import type { ReactNode } from 'react';

type Props = {
  title?: string;
  dek?: string;
  children: ReactNode;
  className?: string;
  width?: 'default' | 'narrow' | 'wide';
};

export default function PageShell({
  title,
  dek,
  children,
  className = '',
  width = 'default',
}: Props) {
  return (
    <div className={`v3-page v3-page--${width} ${className}`.trim()}>
      {(title || dek) && (
        <header className="v3-page-head">
          {title && <h1>{title}</h1>}
          {dek && <p className="v3-page-dek">{dek}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
