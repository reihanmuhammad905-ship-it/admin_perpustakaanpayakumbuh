import test from 'node:test'
import assert from 'node:assert/strict'
import { processExpiredLoans } from './loanRepository.js'

function createStorage(initialValues) {
  const values = new Map(Object.entries(initialValues))
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('settlement otomatis mengembalikan stok tepat satu kali', () => {
  const loan = {
    id: 'TRX-TEST',
    memberId: 'AGT-TEST',
    bookId: 'BK-TEST',
    dueDate: '2 Sep 2026',
    returnDate: null,
    status: 'Dipinjam',
  }
  const book = { id: 'BK-TEST', availableQty: 4, borrowedQty: 1, stockLabel: '4 / 5 unit' }
  globalThis.CustomEvent = class CustomEvent {
    constructor(type) {
      this.type = type
    }
  }
  globalThis.window = {
    localStorage: createStorage({
      'payakumbuh.library.loans': JSON.stringify([loan]),
      'payakumbuh.library.books': JSON.stringify([book]),
    }),
    dispatchEvent() {},
  }

  const firstRun = processExpiredLoans(new Date(2026, 8, 3))
  const firstBook = JSON.parse(window.localStorage.getItem('payakumbuh.library.books'))[0]
  const secondRun = processExpiredLoans(new Date(2026, 8, 3))
  const secondBook = JSON.parse(window.localStorage.getItem('payakumbuh.library.books'))[0]

  assert.equal(firstRun[0].status, 'Berakhir Otomatis')
  assert.equal(firstBook.availableQty, 5)
  assert.equal(secondRun[0].status, 'Berakhir Otomatis')
  assert.equal(secondBook.availableQty, 5)

  delete globalThis.window
  delete globalThis.CustomEvent
})
