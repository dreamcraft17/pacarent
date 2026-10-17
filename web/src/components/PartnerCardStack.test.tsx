import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { discoverMarketing } from '../copy/discover-marketing';
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
      screen.getByRole('heading', { name: discoverMarketing.launchEmpty.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daftar jadi pendamping' })).toHaveAttribute('href', '/mitra/daftar');
    expect(screen.getByRole('link', { name: 'Mode daftar' })).toHaveAttribute('href', '/cari');
    expect(screen.getByRole('link', { name: 'Daftar sebagai pengguna' })).toHaveAttribute('href', '/register');
  });

  it('keeps filtered empty state separate from launch state', () => {
    renderStack({ hasActiveFilters: true, onResetFilters: () => undefined });

    expect(screen.getByRole('heading', { name: 'Belum ada pendamping' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: discoverMarketing.launchEmpty.title }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset filter' })).toBeInTheDocument();
  });

  it('exposes the API failure recovery action', () => {
    renderStack({ fetchFailed: true, onReload: () => undefined });

    expect(screen.getByRole('heading', { name: 'Tidak bisa memuat profil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
