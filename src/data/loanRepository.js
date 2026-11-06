import { LOANS } from './loans.js'
import { adjustBookStock, getBooks, saveBooks } from './bookRepository.js'

const STORAGE_KEY = 'payakumbuh.library.loans'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function parseDate(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const match = String(value).match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (!match) return null
  const month = MONTHS.findIndex((item) => item.toLowerCase() === match[2].toLowerCase())
  if (month < 0) return null
  return new Date(Number(match[3]), month, Number(match[1]))
}

function toDisplayDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function deriveLoanStatus(loan, now = new Date()) {
  if (loan.returnDate) return 'Dikembalikan'
  if (loan.status === 'Berakhir Otomatis') return 'Berakhir Otomatis'
  const dueDate = parseDate(loan.dueDate)
  return dueDate && dueDate <= startOfDay(now) ? 'Berakhir Otomatis' : 'Dipinjam'
}

function normalizeLoan(loan) {
  return { ...loan, status: deriveLoanStatus(loan) }
}

function readStoredLoans() {
  if (typeof window === 'undefined') return LOANS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const loans = stored ? JSON.parse(stored) : LOANS
    return Array.isArray(loans) ? loans : LOANS
  } catch {
    return LOANS
  }
}

export function processExpiredLoans(now = new Date()) {
  const loans = readStoredLoans()
  const completedAt = toDisplayDate(now)
  const expiredBookIds = []
  const processedLoans = loans.map((loan) => {
    if (
      loan.status === 'Dikembalikan' ||
      loan.status === 'Berakhir Otomatis' ||
      !parseDate(loan.dueDate) ||
      parseDate(loan.dueDate) > startOfDay(now)
    ) {
      return loan
    }
    expiredBookIds.push(loan.bookId)
    return {
      ...loan,
      status: 'Berakhir Otomatis',
      returnDate: completedAt,
      completedAt,
      accessRevokedAt: completedAt,
    }
  })

  if (expiredBookIds.length === 0 || typeof window === 'undefined') return processedLoans

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(processedLoans))
  const books = getBooks().map((book) => {
    const completedCount = expiredBookIds.filter((bookId) => bookId === book.id).length
    if (!completedCount || book.availableQty === undefined) return book
    const availableQty = Math.max(0, book.availableQty + completedCount)
    const borrowedQty = Math.max(0, (book.borrowedQty || 0) - completedCount)
    return {
      ...book,
      availableQty,
      borrowedQty,
      stockLabel: `${availableQty} / ${availableQty + borrowedQty} unit`,
      accessStatus: availableQty > 0 ? 'Tersedia' : 'Tidak Tersedia',
    }
  })
  saveBooks(books)
  window.dispatchEvent(new CustomEvent('library-loans-updated'))
  return processedLoans
}

export function getLoans() {
  const loans = processExpiredLoans()
  return loans.map((loan) => normalizeLoan(loan))
}

export function saveLoans(loans) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))
  window.dispatchEvent(new CustomEvent('library-loans-updated'))
}

export function markLoanReturned(id) {
  const returnDate = toDisplayDate(new Date())
  const sourceLoans = processExpiredLoans()
  const target = sourceLoans.find((loan) => loan.id === id)
  if (!target || target.status !== 'Dipinjam') return sourceLoans.map((loan) => normalizeLoan(loan))
  const loans = sourceLoans.map((loan) =>
    loan.id === id ? { ...loan, returnDate, status: 'Dikembalikan', completedAt: returnDate } : loan
  )
  saveLoans(loans)
  adjustBookStock(target.bookId, 1)
  return loans
}

export function extendLoan(id, days = 7) {
  const loans = processExpiredLoans().map((loan) => {
    if (loan.id !== id) return loan
    const dueDate = parseDate(loan.dueDate)
    if (!dueDate) return loan
    dueDate.setDate(dueDate.getDate() + days)
    return { ...loan, dueDate: toDisplayDate(dueDate), status: deriveLoanStatus({ ...loan, dueDate: toDisplayDate(dueDate) }) }
  })
  saveLoans(loans)
  return loans
}

export function subscribeToLoans(onChange) {
  if (typeof window === 'undefined') return () => {}
  const handleChange = () => onChange(getLoans())
  window.addEventListener('storage', handleChange)
  window.addEventListener('library-loans-updated', handleChange)
  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener('library-loans-updated', handleChange)
  }
}

export function dateToInputValue(value) {
  const date = parseDate(value)
  if (!date) return ''
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}
