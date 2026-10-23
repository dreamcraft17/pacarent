import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TermsPage from './TermsPage';

function renderTermsPage() {
  render(
    <MemoryRouter>
      <TermsPage />
    </MemoryRouter>,
  );
}

describe('TermsPage', () => {
  it('shows the page heading', () => {
    renderTermsPage();
    expect(screen.getByRole('heading', { name: 'Syarat & Ketentuan' })).toBeInTheDocument();
  });

  it('has a table-of-contents navigation landmark', () => {
    renderTermsPage();
    expect(screen.getByRole('navigation', { name: 'Daftar isi Syarat dan Ketentuan' })).toBeInTheDocument();
  });

  it('links the table of contents to its section anchor', () => {
    renderTermsPage();
    expect(screen.getByRole('link', { name: 'Kesepakatan & pembayaran' })).toHaveAttribute('href', '#kesepakatan');
  });

  it('includes the chat/schedule/meetup section', () => {
    renderTermsPage();
    expect(screen.getByRole('heading', { name: 'Chat, jadwal & ketemuan' })).toBeInTheDocument();
    expect(screen.getByText('Baca bagian ini sebelum mulai chat atau ketemuan.')).toBeInTheDocument();
  });
});
