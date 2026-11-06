export const STATS = {
  totalAnggotaAktif: { value: '3.428', sub: '+124 anggota baru bulan ini' },
  peminjamanBulanIni: { value: '1.256', sub: '+8% dibanding bulan lalu' },
  bukuBerakhirOtomatis: { value: '27', sub: 'Masa peminjaman selesai' },
  bukuHampirHabis: { value: '14', sub: 'Stok fisik menipis' },
}

export const LOAN_TREND_7D = [
  { label: 'Sen', total: 38 },
  { label: 'Sel', total: 52 },
  { label: 'Rab', total: 45 },
  { label: 'Kam', total: 63 },
  { label: 'Jum', total: 58 },
  { label: 'Sab', total: 34 },
  { label: 'Min', total: 27 },
]

const BASE_30D = [
  22, 28, 31, 26, 35, 40, 33, 29, 38, 45, 41, 36, 48, 52, 47, 39, 44, 50, 55, 49, 42, 46, 53, 58, 51, 45, 39, 43, 57,
  61,
]

export const LOAN_TREND_30D = BASE_30D.map((total, i) => ({ label: String(i + 1), total }))

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'peminjaman',
    text: 'Rizky Pratama meminjam "Sistem Informasi Manajemen"',
    time: '5 menit lalu',
  },
  {
    id: 2,
    type: 'pengembalian',
    text: 'Siti Aminah mengembalikan "Tenggelamnya Kapal Van der Wijck"',
    time: '22 menit lalu',
  },
  {
    id: 3,
    type: 'anggota',
    text: 'Anggota baru terdaftar: Fajar Ramadhan',
    time: '48 menit lalu',
  },
  {
    id: 4,
    type: 'peminjaman',
    text: 'Dedi Kurniawan meminjam "Panduan Digital Marketing"',
    time: '1 jam lalu',
  },
  {
    id: 5,
    type: 'berakhir',
    text: 'Peminjaman "Sejarah Kota Payakumbuh" oleh Nurul Huda berakhir otomatis',
    time: '2 jam lalu',
  },
  {
    id: 6,
    type: 'pengembalian',
    text: 'Bagus Setiawan mengembalikan "Adat Basandi Syarak, Syarak Basandi Kitabullah"',
    time: '4 jam lalu',
  },
  {
    id: 7,
    type: 'anggota',
    text: 'Anggota baru terdaftar: Yuni Lestari',
    time: 'Kemarin, 16:40',
  },
  {
    id: 8,
    type: 'peminjaman',
    text: 'Nurul Huda meminjam "Sistem Informasi Manajemen"',
    time: 'Kemarin, 10:12',
  },
]

export const ATTENTION_BOOKS = [
  {
    id: 'BK-1002',
    title: 'Tenggelamnya Kapal Van der Wijck',
    author: 'Hamka',
    reason: 'Antrian Panjang',
    detail: '18 anggota dalam antrian peminjaman',
    coverColor: '#0f766e',
  },
  {
    id: 'BK-1003',
    title: 'Panduan Digital Marketing',
    author: 'Rizky Pratama',
    reason: 'Limit Hampir Habis',
    detail: '47/50 halaman terpakai hari ini',
    coverColor: '#4338ca',
  },
  {
    id: 'BK-1005',
    title: 'Adat Basandi Syarak, Syarak Basandi Kitabullah',
    author: 'Prof. Dr. H. Musyair Zainuddin',
    reason: 'Stok Habis',
    detail: '0 dari 6 unit fisik tersedia',
    coverColor: '#b45309',
  },
  {
    id: 'BK-1004',
    title: 'Sistem Informasi Manajemen',
    author: 'Dr. Andri Kurniawan',
    reason: 'Antrian Panjang',
    detail: '11 anggota dalam antrian peminjaman',
    coverColor: '#334155',
  },
]
