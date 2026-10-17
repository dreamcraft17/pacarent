import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PartnerCardStack from './PartnerCardStack';

function renderStack(props: Partial<ComponentProps<typeof PartnerCardStack>> = {}) {
  return render(
    <MemoryRouter>
      <PartnerCardStack partners={[]} {...props} />
    </MemoryRouter>,
  );
}

describe('PartnerCardStack launch state', () => {
  it('shows shared launch empty state with partner and user paths', () => {
    renderStack();

    expect(
      screen.getByRole('heading', { name: 'Temukan teman untuk momen yang kamu rencanakan.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ajukan jadi mitra' })).toHaveAttribute('href', '/mitra/daftar');
    expect(screen.getByRole('link', { name: 'Mode daftar' })).toHaveAttribute('href', '/cari');
    expect(screen.getByRole('link', { name: 'Daftar sebagai pengguna' })).toHaveAttribute('href', '/register');
  });

  it('keeps filtered empty state separate from launch state', () => {
    renderStack({ hasActiveFilters: true, onResetFilters: () => undefined });

    expect(screen.getByRole('heading', { name: 'Belum ada mitra' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Temukan teman untuk momen yang kamu rencanakan.' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset filter' })).toBeInTheDocument();
  });

  it('exposes the API failure recovery action', () => {
    renderStack({ fetchFailed: true, onReload: () => undefined });

    expect(screen.getByRole('heading', { name: 'Tidak bisa memuat profil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
