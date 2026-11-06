const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
}

function parseIndonesianDate(value) {
  if (!value || value === 'Belum ada') return null
  const match = value.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/)
  if (!match) return null
  const [, day, month, year] = match
  return new Date(Number(year), MONTHS[month] ?? 0, Number(day))
}

export function getLibraryDashboardStats({ members = [], books = [], loans = [] }) {
  const today = new Date()
  const totalAnggota = members.length
  const totalKoleksiBuku = books.length
  const peminjamanAktif = loans.filter((loan) => loan.status === 'Dipinjam').length
  const berakhirOtomatis = loans.filter((loan) => loan.status === 'Berakhir Otomatis').length

  const totalAnggotaBaruBulanIni = members.filter((member) => {
    const date = parseIndonesianDate(member.joinDate)
    return date && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }).length

  const peminjamanHariIni = loans.filter((loan) => {
    const date = parseIndonesianDate(loan.borrowDate)
    return date && date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }).length

  return {
    totalAnggota,
    totalAnggotaBaruBulanIni,
    totalKoleksiBuku,
    bukuDitambahkanBulanIni: 0,
    peminjamanAktif,
    berakhirOtomatis,
    peminjamanHariIni,
  }
}

export function getAutomaticallyEndedLoans(loans = []) {
  return loans.filter((loan) => loan.status === 'Berakhir Otomatis')
}
