const monthlyTrend = [
  { month: 'Okt', loans: 164, returns: 118 },
  { month: 'Nov', loans: 188, returns: 141 },
  { month: 'Des', loans: 212, returns: 168 },
  { month: 'Jan', loans: 196, returns: 174 },
  { month: 'Feb', loans: 238, returns: 201 },
  { month: 'Mar', loans: 224, returns: 198 },
  { month: 'Apr', loans: 262, returns: 219 },
  { month: 'Mei', loans: 286, returns: 241 },
  { month: 'Jun', loans: 304, returns: 266 },
  { month: 'Jul', loans: 328, returns: 282 },
  { month: 'Agu', loans: 351, returns: 307 },
  { month: 'Sep', loans: 374, returns: 326 },
]

const categoryDistribution = [
  { name: 'Fiksi', value: 32, color: '#059669' },
  { name: 'Non-Fiksi', value: 24, color: '#0284c7' },
  { name: 'Sejarah', value: 18, color: '#d97706' },
  { name: 'Pendidikan', value: 16, color: '#4f46e5' },
  { name: 'Anak-anak', value: 10, color: '#db2777' },
]

const popularBooks = [
  { rank: 1, title: 'Laskar Pelangi', category: 'Fiksi', borrowed: 284, stock: 12 },
  { rank: 2, title: 'Atomic Habits', category: 'Non-Fiksi', borrowed: 261, stock: 8 },
  { rank: 3, title: 'Sejarah Kota Payakumbuh', category: 'Sejarah', borrowed: 238, stock: 5 },
  { rank: 4, title: 'Matematika Dasar untuk Semua', category: 'Pendidikan', borrowed: 219, stock: 14 },
  { rank: 5, title: 'Bumi', category: 'Fiksi', borrowed: 204, stock: 9 },
  { rank: 6, title: 'Ensiklopedia Anak Nusantara', category: 'Anak-anak', borrowed: 192, stock: 11 },
  { rank: 7, title: 'Filosofi Teras', category: 'Non-Fiksi', borrowed: 181, stock: 7 },
  { rank: 8, title: 'Negeri 5 Menara', category: 'Fiksi', borrowed: 176, stock: 10 },
  { rank: 9, title: 'Indonesia dalam Arus Sejarah', category: 'Sejarah', borrowed: 163, stock: 4 },
  { rank: 10, title: 'Belajar Coding dari Nol', category: 'Pendidikan', borrowed: 154, stock: 16 },
]

const activeMembers = [
  { name: 'Rizky Pratama', memberId: 'AGT-2001', total: 34, active: 2, points: 920 },
  { name: 'Siti Aminah', memberId: 'AGT-2002', total: 29, active: 1, points: 810 },
  { name: 'Nurul Huda', memberId: 'AGT-2003', total: 27, active: 3, points: 764 },
  { name: 'Yuni Lestari', memberId: 'AGT-2006', total: 23, active: 1, points: 688 },
  { name: 'Fajar Ramadhan', memberId: 'AGT-2007', total: 21, active: 0, points: 624 },
]

const recentActivities = [
  { type: 'borrow', title: 'Buku "Atomic Habits" dipinjam oleh Siti Aminah', time: '12 menit lalu' },
  { type: 'member', title: 'Anggota baru mendaftar: Fajar Ramadhan', time: '48 menit lalu' },
  { type: 'return', title: 'Buku "Laskar Pelangi" dikembalikan oleh Rizky Pratama', time: '1 jam lalu' },
  { type: 'ended', title: 'Peminjaman "Sejarah Kota Payakumbuh" berakhir otomatis', time: '2 jam lalu' },
  { type: 'borrow', title: 'Buku "Bumi" dipinjam oleh Yuni Lestari', time: '3 jam lalu' },
  { type: 'member', title: 'Anggota baru mendaftar: Andika Putra', time: '5 jam lalu' },
]

export async function getReportSummary(range = 'month') {
  return {
    range,
    cards: [
      { label: 'Total Buku', value: '12.480', change: 8.4, direction: 'up', tone: 'emerald' },
      { label: 'Total Peminjaman', value: '3.842', change: 12.8, direction: 'up', tone: 'blue' },
      { label: 'Anggota Aktif', value: '3.428', change: 5.2, direction: 'up', tone: 'emerald' },
      { label: 'Berakhir Otomatis', value: '27', change: 3.1, direction: 'down', tone: 'red' },
    ],
    monthlyTrend,
    categoryDistribution,
    popularBooks,
    activeMembers,
    recentActivities,
  }
}

export async function exportReport(format, range) {
  return { ok: true, format, range, message: `Laporan ${range} siap diekspor sebagai ${format}.` }
}
