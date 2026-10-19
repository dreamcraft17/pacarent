import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('organizes the summary with navigable sections', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { name: 'Syarat & Ketentuan' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Daftar isi Syarat dan Ketentuan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kesepakatan & pembayaran' })).toHaveAttribute('href', '#kesepakatan');
    expect(screen.getByRole('heading', { name: 'Request, chat & pertemuan' })).toBeInTheDocument();
    expect(screen.getByText('Baca bagian ini sebelum mengirim request atau bertemu.')).toBeInTheDocument();
  });
});
