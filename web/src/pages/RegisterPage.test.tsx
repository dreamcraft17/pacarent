import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../auth/AuthContext';

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /daftar/i }));
}

describe('RegisterPage validation', () => {
  beforeEach(() => {
    // AuthProvider calls GET /api/auth/me on mount; treat as logged-out so it
    // never touches real network, and submit() calls stay unmocked by default
    // since every test below stops at a validation error before that point.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'unauth' }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requires an email', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await submit(user);

    expect(await screen.findByText('Email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('rejects a malformed email', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await submit(user);

    expect(await screen.findByText('Format email belum bener.')).toBeInTheDocument();
  });

  it('rejects a birth date under the minimum age', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Nama lengkap'), 'Budi');
    const thisYear = new Date().getFullYear();
    await user.type(screen.getByLabelText('Tanggal lahir'), `${thisYear - 10}-01-01`);
    await submit(user);

    expect(await screen.findByText('Minimal usia 18 tahun ya.')).toBeInTheDocument();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Nama lengkap'), 'Budi');
    await user.type(screen.getByLabelText('Tanggal lahir'), '2000-01-01');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByLabelText('Gue setuju'));
    await submit(user);

    expect(await screen.findByText((_, el) => el?.id === 'pw-error')).toHaveTextContent('Minimal 8 karakter.');
  });

  it('requires terms to be accepted', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Nama lengkap'), 'Budi');
    await user.type(screen.getByLabelText('Tanggal lahir'), '2000-01-01');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await submit(user);

    expect(await screen.findByText('Harus disetujui dulu sebelum daftar.')).toBeInTheDocument();
  });

  it('submits with gender left unanswered and does not block on it', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('/api/auth/register')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ accessToken: 'token', refreshToken: 'refresh' }),
        };
      }
      return { ok: false, status: 401, json: async () => ({ message: 'unauth' }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    renderRegisterPage();
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Nama lengkap'), 'Budi');
    await user.type(screen.getByLabelText('Tanggal lahir'), '2000-01-01');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByLabelText('Gue setuju'));
    await submit(user);

    await waitFor(() => {
      const registerCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/api/auth/register'));
      expect(registerCall).toBeDefined();
      const body = JSON.parse(String(registerCall![1].body));
      expect(body.gender).toBeNull();
    });
  });
});
