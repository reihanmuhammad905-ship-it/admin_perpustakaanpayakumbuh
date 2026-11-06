import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeaderUtilities from '../components/HeaderUtilities'
import StatCard from '../components/StatCard'
import RowActionsMenu from '../components/RowActionsMenu'
import BookFormModal from '../components/BookFormModal'
import { CategoryFormModal, CategoryManagerModal } from '../components/CategoryModal'
import Toast from '../components/Toast'
import { FORMATS, ACCESS_STATUSES } from '../data/books'
import { accessBadgeClass, formatBadgeClass } from '../utils/badges'
import { IconPlus, IconSearch, IconChevronDown, IconBook } from '../icons/Icons'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAdminBooks,
  getCategories,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover,
  uploadBookPdf,
  createCategory,
  updateCategory,
  deleteCategory,
  API_BASE,
} from '../services/adminApi'

const COVER_PALETTE = ['#059669', '#0284c7', '#d97706', '#4f46e5', '#db2777', '#0f766e', '#b91c1c']
function colorForBook(book) {
  const key = String(book?.title || book?.id || '')
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return COVER_PALETTE[hash % COVER_PALETTE.length]
}

const ALL = 'Semua'

function getAvailabilityStatus(book) {
  const value = (book.accessStatus || '').toString()
  if (/tidak tersedia|0\s*\/|stok habis/i.test(value)) return 'Tidak Tersedia'
  if (/sedang dipinjam|dipinjam/i.test(value)) return 'Sedang Dipinjam'
  return 'Tersedia'
}

export default function ManajemenBuku() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  async function loadData() {
    setLoading(true)
    setLoadError('')
    try {
      const [booksResult, categoriesResult] = await Promise.all([getAdminBooks(token), getCategories(token)])
      setBooks(booksResult.books || [])
      setCategories(categoriesResult.categories || [])
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) setSearch(q)
  }, [searchParams])

  const [filterCategory, setFilterCategory] = useState(ALL)
  const [filterFormat, setFilterFormat] = useState(ALL)
  const [filterAvailability, setFilterAvailability] = useState(ALL)

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter((b) => {
      if (q) {
        const hay = `${b.title} ${b.author} ${b.isbn}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterCategory !== ALL && b.category !== filterCategory) return false
      if (filterFormat !== ALL && b.format !== filterFormat) return false
      if (filterAvailability !== ALL && getAvailabilityStatus(b) !== filterAvailability) return false
      return true
    })
  }, [books, search, filterCategory, filterFormat, filterAvailability])

  const allSelected = filteredBooks.length > 0 && filteredBooks.every((b) => selectedIds.has(b.id))

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredBooks.map((b) => b.id)))
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openAddBook() {
    setEditingBook(null)
    setBookModalOpen(true)
  }

  function openEditBook(book) {
    setEditingBook(book)
    setBookModalOpen(true)
  }

  async function handleBookSaved(book) {
    const { coverFile, pdfFile, ...bookData } = book
    try {
      let bookId = editingBook?.id
      if (editingBook) {
        await updateBook(token, editingBook.id, bookData)
        showToast(`Perubahan pada "${book.title}" berhasil disimpan.`)
      } else {
        const result = await createBook(token, bookData)
        bookId = result.id
        showToast(`"${book.title}" berhasil ditambahkan ke katalog.`)
      }

      if (coverFile && bookId) {
        try {
          await uploadBookCover(token, bookId, coverFile)
        } catch (coverError) {
          showToast(`Buku tersimpan, tapi cover gagal diunggah: ${coverError.message}`)
        }
      }

      if (pdfFile && bookId) {
        try {
          await uploadBookPdf(token, bookId, pdfFile)
        } catch (pdfError) {
          showToast(`Buku tersimpan, tapi PDF gagal diunggah: ${pdfError.message}`)
        }
      }

      await loadData()
    } catch (error) {
      showToast(error.message)
    }
    setEditingBook(null)
  }

  async function handleDeleteBook(book) {
    if (!window.confirm(`Hapus "${book.title}" dari katalog?`)) return
    try {
      await deleteBook(token, book.id)
      showToast(`"${book.title}" dihapus dari katalog.`)
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
  }

  async function handleCategorySave(category) {
    try {
      if (editingCategory) {
        await updateCategory(token, editingCategory.id, category)
        showToast(`Kategori "${category.name}" berhasil diperbarui.`)
      } else {
        await createCategory(token, category)
        showToast(`Kategori "${category.name}" berhasil ditambahkan.`)
      }
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
    setEditingCategory(null)
    setCategoryFormOpen(false)
  }

  async function handleDeleteCategory(category) {
    try {
      await deleteCategory(token, category.id)
      showToast(`Kategori "${category.name}" berhasil dihapus.`)
      await loadData()
    } catch (error) {
      showToast(error.message)
    }
  }

  const totalJudul = books.length
  const totalTersedia = books.filter((book) => getAvailabilityStatus(book) === 'Tersedia').length
  const totalDipinjam = books.filter((book) => getAvailabilityStatus(book) === 'Sedang Dipinjam').length
  const totalKategori = categories.length

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[13px] text-slate-400">
        Memuat data buku...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="max-w-sm text-[13px] text-slate-500">{loadError}</p>
        <button
          onClick={loadData}
          className="rounded-[9px] bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">Manajemen Buku</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">Kelola katalog buku dan kategori perpustakaan.</p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          onClick={openAddBook}
          className="flex items-center gap-2 rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <IconPlus className="h-4 w-4" />
          Tambah Buku Baru
        </button>
        <button
          onClick={() => {
            setEditingCategory(null)
            setCategoryFormOpen(true)
          }}
          className="flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          <IconPlus className="h-4 w-4" />
          Tambah Kategori
        </button>
        <button
          onClick={() => setCategoryManagerOpen(true)}
          className="flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          Kelola Kategori
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconBook}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-700"
          value={totalJudul.toLocaleString('id-ID')}
          label="Total Judul Buku"
          sub="Seluruh judul buku dalam katalog"
          to="/buku"
        />
        <StatCard
          icon={IconBook}
          iconBgClass="bg-sky-50"
          iconColorClass="text-sky-700"
          value={totalTersedia.toLocaleString('id-ID')}
          label="Buku Tersedia"
          sub="Buku yang tersedia untuk dipinjam"
          to="/buku"
        />
        <StatCard
          icon={IconBook}
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-700"
          value={totalDipinjam.toLocaleString('id-ID')}
          label="Buku Sedang Dipinjam"
          sub="Buku yang sedang dipinjam anggota"
          to="/peminjaman"
        />
        <StatCard
          icon={IconBook}
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
          value={totalKategori.toLocaleString('id-ID')}
          label="Kategori Buku"
          sub="Total kategori dalam perpustakaan"
          to="/buku"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5">
          <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul buku, penulis, ISBN..."
            className="w-full border-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <FilterSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[ALL, ...categories.map((category) => category.name)]}
          allLabel="Semua Kategori"
        />
        <FilterSelect
          value={filterFormat}
          onChange={setFilterFormat}
          options={[ALL, ...FORMATS]}
          allLabel="Semua Format"
        />
        <FilterSelect
          value={filterAvailability}
          onChange={setFilterAvailability}
          options={[ALL, ...ACCESS_STATUSES]}
          allLabel="Semua Status"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-11 border-y border-slate-100 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <Th>Cover &amp; Informasi Buku</Th>
                <Th>Kategori</Th>
                <Th>Tipe / Format</Th>
                <Th>Stok</Th>
                <Th>Status Akses</Th>
                <Th align="right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(book.id)}
                      onChange={() => toggleSelectOne(book.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md shadow-sm"
                        style={{ backgroundColor: colorForBook(book) }}
                      >
                        {book.coverUrl ? (
                          <img src={`${API_BASE}${book.coverUrl}`} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <IconBook className="h-5 w-5 text-white/85" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[220px] truncate text-[12.9px] font-semibold text-slate-900">
                          {book.title}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-slate-500">{book.author}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">ISBN {book.isbn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-600">
                      {book.category}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${formatBadgeClass(
                        book.format
                      )}`}
                    >
                      {book.format}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5 text-[12.5px] text-slate-600">
                    {book.stockLabel}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-3.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${accessBadgeClass(
                        getAvailabilityStatus(book)
                      )}`}
                    >
                      {getAvailabilityStatus(book)}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3.5 text-right">
                    <RowActionsMenu
                      onDetail={() => showToast(`Menampilkan detail "${book.title}".`)}
                      onEdit={() => openEditBook(book)}
                      onDelete={() => handleDeleteBook(book)}
                    />
                  </td>
                </tr>
              ))}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-[13px] text-slate-400">
                    Tidak ada buku yang cocok dengan pencarian atau filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="text-[12px] text-slate-500">Menampilkan {filteredBooks.length} dari {books.length} buku</span>
          <div className="flex items-center gap-1.5">
            <PageButton disabled>‹ Prev</PageButton>
            <PageButton active>1</PageButton>
            <PageButton>Next ›</PageButton>
          </div>
        </div>
      </div>

      <BookFormModal
        open={bookModalOpen}
        initialBook={editingBook}
        categories={categories}
        onClose={() => setBookModalOpen(false)}
        onSaved={(b) => {
          handleBookSaved(b)
          setBookModalOpen(false)
        }}
      />

      <CategoryFormModal
        open={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false)
          setEditingCategory(null)
        }}
        initialCategory={editingCategory}
        onSave={(category) => {
          handleCategorySave(category)
          setCategoryFormOpen(false)
        }}
      />

      <CategoryManagerModal
        open={categoryManagerOpen}
        categories={categories}
        onClose={() => setCategoryManagerOpen(false)}
        onCreate={() => {
          setEditingCategory(null)
          setCategoryFormOpen(true)
        }}
        onEdit={(category) => {
          setEditingCategory(category)
          setCategoryFormOpen(true)
        }}
        onDelete={handleDeleteCategory}
      />

      <Toast message={toast} />
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th
      className={`border-y border-slate-100 px-3.5 py-3 text-[11.5px] font-bold uppercase tracking-wide text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-[9px] border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-[12.8px] font-medium text-slate-700 outline-none focus:border-emerald-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === ALL ? allLabel : opt}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function PageButton({ children, active, disabled }) {
  return (
    <button
      disabled={disabled}
      className={`rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? 'bg-emerald-600 text-white'
          : disabled
          ? 'cursor-not-allowed text-slate-300'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}
