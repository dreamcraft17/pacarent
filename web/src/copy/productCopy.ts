/**
 * Microcopy v3 — casual "you" voice (dating-app clarity, bukan dating outcome).
 * Ref: Bumble reassurance + Tinder pep-talk + TanTan simple/heart — adapted for booking.
 */
export const productCopy = {
  meta: {
    description:
      'Kondangan tapi minus one? Di PacaRent kamu booking teman kencan verified — bukan swipe, bukan cari jodoh.',
  },
  brandTag: 'Plus one, tanpa drama',
  discover: {
    eyebrow: 'Buat event, date, atau nongkrong',
    title: 'Mau datang sendiri atau bawa plus-one?',
    lead: 'Cari pendamping verified yang vibes-nya cocok, atur tanggal & tempat, lalu booking. Gak perlu match dulu.',
    profileCount: (n: number) => (n === 1 ? '1 profil buat kamu' : `${n} profil buat kamu`),
    ctaProfile: 'Lihat vibe & booking',
    filterEmptyTitle: 'Belum ada yang pas filter ini',
    filterEmptyLead: 'Coba kota atau kategori lain, atau reset dulu.',
    filterReset: 'Reset filter',
  },
  trustRail: [
    'Verified',
    'Tertarik → langsung atur jadwal',
    'Bukan app swipe',
    'Bayar aman lewat platform',
  ],
  launchEmpty: {
    eyebrow: 'Early access',
    title: 'Grid masih kosong — tim lagi ngisi profil.',
    lead: 'Daftar dulu biar dapat kabar pas ada pendamping live. Mau jadi pendamping? Join juga — 18+, tempat publik, S&K jelas.',
    steps: [
      { title: 'Swipe mata', sub: 'Baca bio & tarif' },
      { title: 'Atur jadwal', sub: 'Tanggal, durasi, lokasi' },
      { title: 'Done', sub: 'Status ke-save di akunmu' },
    ],
    ctaUser: 'Daftar — kabarin aku',
    ctaCompanion: 'Mau jadi pendamping',
    ctaTerms: 'Baca S&K dulu',
  },
  auth: {
    loginAsideKicker: 'Balik lagi',
    loginAsideTitle: 'Lanjutin rencanamu',
    loginAsideLead: 'Masuk biar booking, jadwal, sama ulasan nggak ilang.',
    loginBullets: [
      'Tadi lihat profil? Lanjut booking dari sini.',
      'Early access — bayar online menyusul.',
      'Ada tombol bantuan pas pertemuan.',
    ],
    loginHeading: 'Masuk yuk',
    loginSubmit: 'Masuk',
    loginRegister: 'Belum punya akun? Daftar',
    registerAsideKicker: '18+',
    registerAsideTitle: 'Daftar, terus jelajah',
    registerAsideLead: 'Bukan chat anonim — semua lewat booking yang jelas.',
    registerBullets: [
      'Setuju S&K & privasi (UU PDP).',
      'Testing: biasanya langsung bisa masuk.',
      'Kontak darurat opsional di profil.',
    ],
    registerHeading: 'Buat akun',
    registerSubmit: 'Daftar',
  },
  nav: {
    explore: 'Jelajahi',
    bookings: 'Jadwal',
    profile: 'Profil',
    login: 'Masuk',
    register: 'Daftar',
  },
  booking: {
    pageTitle: 'Jadwal kamu',
    pageDekEarly:
      'Early access: belum bayar online. Setelah pendamping terima, koordinasi aja terus tandai selesai.',
    pageDekPay: 'Setelah diterima, kamu bisa bayar lewat platform.',
    empty: 'Belum ada jadwal. Balik jelajahi dulu?',
    detailPanel: 'Atur pertemuan',
    submit: 'Kirim booking',
    success: 'Booking kekirim. Tunggu pendamping jawab ya.',
    profileVerified: 'Verified',
    form: {
      category: 'Buat acara apa?',
      when: 'Kapan?',
      duration: 'Berapa jam?',
      location: 'Ketemuan di mana?',
      locationPlaceholder: 'Cafe, mall, tempat rame — skip rumah pribadi dulu ya',
      notes: 'Catatan buat pendamping (opsional)',
      costTitle: 'Hitung dulu',
      costCompanion: (hours: number) => `Pendamping · ${hours} jam`,
      costPlatform: 'Biaya platform (15%)',
      costTotal: 'Total',
      policyCancel:
        'Batal? Refund 100% kalau ≥48 jam sebelum jadwal, 75% (≥24 jam), 50% (≥12 jam).',
      policyPublic: 'Ketemu di tempat umum & rame — pertemuan pertama jangan di rumah.',
      policyTermsPrefix: 'Dana ditahan sampai selesai. Baca',
      policyTermsLink: 'S&K',
    },
    reviewsTitle: 'Yang lain bilang apa',
    reviewsEmpty: 'Belum ada review — kamu bisa jadi yang pertama.',
    shareCta: 'Bagikan rencana',
    shareNoContact: 'Isi kontak darurat dulu di profil',
    shareMessage: (partnerName: string, when: string, location: string) =>
      `Halo, aku ada rencana ketemu ${partnerName} lewat PacaRent pada ${when} di ${location}. Share ini biar kamu tau rencanaku ya 🙏`,
  },
  profile: {
    title: 'Profil kamu',
    dek: 'Data akun & kontak darurat (opsional).',
    saved: 'Ke-save.',
  },
  companionApply: {
    title: 'Jadi pendamping',
    dek: 'Tarif & bio kamu yang atur. Verified, 18+, ketemu di tempat public dulu.',
    success: 'Profil aktif — kamu bisa terima booking sekarang.',
  },
  membership: {
    navLabel: 'PacaRent Plus',
    title: 'Pilih paketmu',
    dek: 'Gratis selamanya buat coba-coba, upgrade kalau kamu udah sering booking. Harga masih uji coba (TBD).',
    currentBadge: 'Paket kamu',
    priceFree: 'Gratis',
    choose: 'Pilih paket',
    processing: 'Memproses…',
    cancel: 'Batalkan langganan',
    cancelled: 'Langganan dibatalkan. Akses tetap jalan sampai periode berakhir.',
    subscribed: 'Paket aktif (mock). Nikmati fiturnya!',
    mockNotice: 'Mode sandbox — pembayaran disimulasikan, tidak ada uang asli yang berpindah.',
    boostSection: {
      title: 'Boost listing',
      lead: 'Munculin profilmu di atas grid browse selama 24 jam. Jatah 1×/bulan, gratis buat Pendamping Pro.',
      cta: 'Aktifkan boost',
      used: 'Jatah boost bulan ini sudah dipakai.',
      active: (until: string) => `Boost aktif sampai ${until}.`,
    },
    statsSection: {
      title: 'Stats sederhana',
      views: 'Profil kamu dilihat',
      bookings: 'Total booking masuk',
    },
    bookingCapNotice: (count: number, cap: number) =>
      `Booking aktif: ${count}/${cap}. Upgrade ke Plus biar unlimited.`,
  },
} as const;

/** @deprecated import productCopy — kept for gradual migration */
export const discoverMarketing = {
  meta: productCopy.meta,
  brandTag: productCopy.brandTag,
  discoverIntro: {
    eyebrow: productCopy.discover.eyebrow,
    title: productCopy.discover.title,
    lead: productCopy.discover.lead,
  },
  launchEmpty: {
    eyebrow: productCopy.launchEmpty.eyebrow,
    title: productCopy.launchEmpty.title,
    lead: productCopy.launchEmpty.lead,
  },
  trustRail: productCopy.trustRail,
} as const;
