import { BOOKS } from './books.js'

const STORAGE_KEY = 'payakumbuh.library.books'

export function getBooks() {
  if (typeof window === 'undefined') return BOOKS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const books = stored ? JSON.parse(stored) : BOOKS
    return Array.isArray(books) ? books : BOOKS
  } catch {
    return BOOKS
  }
}

export function saveBooks(books) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  window.dispatchEvent(new CustomEvent('library-books-updated'))
}

export function adjustBookStock(bookId, delta) {
  const books = getBooks().map((book) => {
    if (book.id !== bookId || book.availableQty === undefined) return book
    const availableQty = Math.max(0, book.availableQty + delta)
    const borrowedQty = Math.max(0, (book.borrowedQty || 0) - delta)
    return {
      ...book,
      availableQty,
      borrowedQty,
      stockLabel: `${availableQty} / ${availableQty + borrowedQty} unit`,
      accessStatus: availableQty > 0 ? 'Tersedia' : 'Tidak Tersedia',
    }
  })
  saveBooks(books)
  return books
}
