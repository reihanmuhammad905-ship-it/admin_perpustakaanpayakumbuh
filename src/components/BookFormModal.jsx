import { useEffect, useState } from 'react'
import { IconX, IconImagePlaceholder } from '../icons/Icons'
import { API_BASE } from '../services/adminApi'

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-[9px] border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

export default function BookFormModal({ open, onClose, onSaved, initialBook = null, categories = [] }) {
  const [coverName, setCoverName] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfFile, setPdfFile] = useState(null)

  useEffect(() => {
    if (open) {
      setCoverName('')
      setCoverFile(null)
      setCoverPreview(initialBook?.coverUrl ? `${API_BASE}${initialBook.coverUrl}` : '')
      setPdfName('')
      setPdfFile(null)
    }
  }, [open, initialBook])

  if (!open) return null

  const isEdit = Boolean(initialBook)

  function handleCoverChange(e) {
    const file = e.target.files?.[0] || null
    setCoverFile(file)
    setCoverName(file?.name || '')
    if (file) setCoverPreview(URL.createObjectURL(file))
  }

  function handlePdfChange(e) {
    const file = e.target.files?.[0] || null
    setPdfFile(file)
    setPdfName(file?.name || '')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      title: String(form.get('title') || 'Buku baru'),
      author: String(form.get('author') || '-'),
      publisher: String(form.get('publisher') || '-'),
      year: Number(form.get('year') || new Date().getFullYear()),
      isbn: String(form.get('isbn') || ''),
      category_id: form.get('category') ? Number(form.get('category')) : null,
      format: String(form.get('format') || 'Fisik'),
      description: String(form.get('description') || ''),
      availableQty: Number(form.get('availableQty') ?? initialBook?.availableQty ?? 1),
      pageCount: form.get('pageCount') ? Number(form.get('pageCount')) : null,
      coverFile: coverFile || undefined,
      pdfFile: pdfFile || undefined,
    }

    onSaved?.(payload)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[88vh] w-full max-w-[620px] flex-col rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="font-sans text-[17px] font-bold text-slate-900">
              {isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}
            </div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">Lengkapi informasi katalog buku perpustakaan.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Cover Buku</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 hover:border-emerald-400 hover:bg-emerald-50/40">
                <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-slate-300 shadow-sm">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Preview cover" className="h-full w-full object-cover" />
                  ) : (
                    <IconImagePlaceholder className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-700">
                    {coverName || (coverPreview ? 'Ganti gambar cover' : 'Klik untuk unggah, atau seret file ke sini')}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-400">PNG atau JPG, rasio 2:3, maks 2MB</div>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
            </div>

            <Field label="Judul Buku">
              <input
                name="title"
                required
                defaultValue={initialBook?.title || ''}
                placeholder="Contoh: Sejarah Kota Payakumbuh"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Pengarang">
                <input
                  name="author"
                  required
                  defaultValue={initialBook?.author || ''}
                  placeholder="Nama pengarang"
                  className={inputClass}
                />
              </Field>
              <Field label="Penerbit">
                <input
                  name="publisher"
                  defaultValue={initialBook?.publisher || ''}
                  placeholder="Nama penerbit"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tahun Terbit">
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  defaultValue={initialBook?.year || new Date().getFullYear()}
                  className={inputClass}
                />
              </Field>
              <Field label="Kategori Buku">
                <select
                  name="category"
                  defaultValue={initialBook?.category_id || categories[0]?.id || ''}
                  className={inputClass}
                >
                  {categories.length === 0 && <option value="">Belum ada kategori</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Format">
                <select name="format" defaultValue={initialBook?.format || 'Fisik'} className={inputClass}>
                  <option value="Fisik">Fisik</option>
                  <option value="Digital / E-Book">Digital / E-Book</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </Field>
              <Field label="ISBN">
                <input
                  name="isbn"
                  defaultValue={initialBook?.isbn || ''}
                  placeholder="978-000-0000-00-0"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Stok Tersedia (jumlah eksemplar)">
                <input
                  name="availableQty"
                  type="number"
                  min="0"
                  defaultValue={initialBook?.availableQty ?? 1}
                  className={inputClass}
                />
              </Field>
              <Field label="Jumlah Halaman">
                <input
                  name="pageCount"
                  type="number"
                  min="1"
                  defaultValue={initialBook?.pageCount || ''}
                  placeholder="Contoh: 320"
                  className={inputClass}
                />
              </Field>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">File E-Book (PDF)</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 hover:border-emerald-400 hover:bg-emerald-50/40">
                <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm">
                  <IconImagePlaceholder className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-slate-700">
                    {pdfName ||
                      (initialBook?.fileUrl ? 'Ganti file PDF (sudah ada file saat ini)' : 'Klik untuk unggah file PDF')}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-400">
                    {initialBook?.formatFile ? `Saat ini: ${initialBook.formatFile}` : 'Format PDF, maks 20MB'}
                  </div>
                </div>
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
              </label>
            </div>

            <Field label="Deskripsi">
              <textarea
                name="description"
                rows={3}
                defaultValue={initialBook?.description || ''}
                placeholder="Ringkasan singkat isi buku..."
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-[9px] bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  )
}
