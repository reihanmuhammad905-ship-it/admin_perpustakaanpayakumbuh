import test from 'node:test'
import assert from 'node:assert/strict'
import { getLibraryDashboardStats, getAutomaticallyEndedLoans } from './libraryStats.js'
import { MEMBERS } from './members.js'
import { BOOKS } from './books.js'
import { LOANS } from './loans.js'

test('dashboard stats menghitung data perpustakaan yang relevan', () => {
  const stats = getLibraryDashboardStats({ members: MEMBERS, books: BOOKS, loans: LOANS })

  assert.equal(stats.totalAnggota, MEMBERS.length)
  assert.equal(stats.totalKoleksiBuku, BOOKS.length)
  assert.equal(stats.peminjamanAktif, LOANS.filter((loan) => loan.status === 'Dipinjam').length)
  assert.equal(stats.berakhirOtomatis, LOANS.filter((loan) => loan.status === 'Berakhir Otomatis').length)
})

test('riwayat otomatis menampilkan transaksi yang diselesaikan sistem', () => {
  const ended = getAutomaticallyEndedLoans(LOANS)

  assert.ok(ended.every((loan) => loan.status === 'Berakhir Otomatis'))
})
