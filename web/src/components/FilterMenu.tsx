import { useEffect, useId, useRef, useState } from 'react';

export type FilterOption = { value: string; label: string };

type Props = {
  label: string;
  placeholder: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export default function FilterMenu({ label, placeholder, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`filter-menu${open ? ' open' : ''}${value ? ' has-value' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="filter-menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="filter-menu-value">{display}</span>
        <span className="filter-menu-chevron" aria-hidden />
      </button>
      {open && (
        <ul className="filter-menu-panel" id={listId} role="listbox" aria-label={label}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value || '__all'} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`filter-menu-option${active ? ' active' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <span className="filter-menu-check" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
