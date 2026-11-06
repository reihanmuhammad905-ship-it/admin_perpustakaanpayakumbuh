import { deriveLoanStatus } from './loanRepository.js'

/**
 * Shared authorization policy for digital book content.
 * The backend must call this with its trusted server timestamp before streaming content.
 */
export function getEbookAccessDecision({ loan, userId, bookId, now }) {
  if (!loan) {
    return { allowed: false, code: 'LOAN_NOT_FOUND', message: 'Transaksi peminjaman tidak ditemukan.' }
  }
  if (!userId || loan.memberId !== userId) {
    return { allowed: false, code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke buku ini.' }
  }
  if (!bookId || loan.bookId !== bookId) {
    return { allowed: false, code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke buku ini.' }
  }
  if (loan.returnDate || deriveLoanStatus(loan, now) === 'Dikembalikan') {
    return { allowed: false, code: 'ALREADY_RETURNED', message: 'Buku ini sudah dikembalikan.' }
  }
  if (deriveLoanStatus(loan, now) === 'Berakhir Otomatis') {
    return {
      allowed: false,
      code: 'LOAN_EXPIRED',
      status: 'Berakhir Otomatis',
      dueDate: loan.dueDate,
      message: 'Masa peminjaman buku ini telah berakhir. Silakan kembalikan buku terlebih dahulu.',
    }
  }

  return { allowed: true, code: 'ACTIVE', status: 'Dipinjam', dueDate: loan.dueDate }
}

export function getEbookUserState({ loan, now = new Date() }) {
  if (!loan) return { status: 'Tidak Dipinjam', allowed: false, daysRemaining: 0 }
  const status = deriveLoanStatus(loan, now)
  if (status === 'Dikembalikan' || status === 'Berakhir Otomatis') {
    return { status, allowed: false, daysRemaining: 0, dueDate: loan.dueDate }
  }

  const dueDate = parseDisplayDate(loan.dueDate)
  const current = startOfDay(now)
  const daysRemaining = dueDate ? Math.max(0, Math.ceil((dueDate - current) / 86400000)) : null
  return { status, allowed: true, daysRemaining, dueDate: loan.dueDate }
}

function parseDisplayDate(value) {
  const match = String(value || '').match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+(\d{4})$/i)
  if (!match) return null
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return new Date(Number(match[3]), months.findIndex((month) => month.toLowerCase() === match[2].toLowerCase()), Number(match[1]))
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
