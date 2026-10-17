# Leksikon copy PacaRent

> **Author:** Dozer  
> **Date:** 2026-10-17

Produk = **sewa pacar / teman kencan / temani acara**, bukan marketplace generik “mitra”.

| Hindari (UI) | Pakai |
|--------------|--------|
| mitra | **pendamping** (orang yang menawarkan diri menemani) |
| Mitra terverifikasi | **Pendamping terverifikasi** |
| Ajukan jadi mitra | **Daftar jadi pendamping** |
| Filter mitra | **Filter pendamping** |
| booking mitra | **booking** / **sewa pacar** (sesuai konteks) |

**Tetap internal:** route `/mitra/*`, role API `Partner`, kode `PartnersController` — tidak perlu diubah untuk MVP.

**Dua sisi:** **pengguna** (yang booking) · **pendamping** (yang ditawarkan).
