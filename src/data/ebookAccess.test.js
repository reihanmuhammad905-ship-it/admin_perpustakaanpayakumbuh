import test from 'node:test'
import assert from 'node:assert/strict'
import { getEbookAccessDecision, getEbookUserState } from './ebookAccess.js'

const activeLoan = {
  memberId: 'AGT-1',
  bookId: 'BK-1',
  dueDate: '2 Sep 2026',
  returnDate: null,
}

const beforeDue = new Date(2026, 8, 1)
const afterDue = new Date(2026, 8, 3)

test('ebook aktif selama tanggal server belum melewati jatuh tempo', () => {
  const decision = getEbookAccessDecision({ loan: activeLoan, userId: 'AGT-1', bookId: 'BK-1', now: beforeDue })

  assert.equal(decision.allowed, true)
  assert.equal(decision.status, 'Dipinjam')
})

test('ebook ditolak setelah jatuh tempo dan berakhir otomatis', () => {
  const decision = getEbookAccessDecision({ loan: activeLoan, userId: 'AGT-1', bookId: 'BK-1', now: afterDue })

  assert.equal(decision.allowed, false)
  assert.equal(decision.code, 'LOAN_EXPIRED')
  assert.equal(decision.status, 'Berakhir Otomatis')
})

test('ebook ditolak jika user atau buku tidak cocok', () => {
  const wrongUser = getEbookAccessDecision({ loan: activeLoan, userId: 'AGT-2', bookId: 'BK-1', now: beforeDue })
  const wrongBook = getEbookAccessDecision({ loan: activeLoan, userId: 'AGT-1', bookId: 'BK-2', now: beforeDue })

  assert.equal(wrongUser.code, 'FORBIDDEN')
  assert.equal(wrongBook.code, 'FORBIDDEN')
})

test('transaksi dikembalikan tidak lagi memberi akses', () => {
  const decision = getEbookAccessDecision({
    loan: { ...activeLoan, returnDate: '1 Sep 2026' },
    userId: 'AGT-1',
    bookId: 'BK-1',
    now: beforeDue,
  })
  const state = getEbookUserState({ loan: { ...activeLoan, returnDate: '1 Sep 2026' }, now: beforeDue })

  assert.equal(decision.allowed, false)
  assert.equal(decision.code, 'ALREADY_RETURNED')
  assert.equal(state.allowed, false)
})
