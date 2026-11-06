import { useEffect, useMemo, useState } from 'react'
import { IconX, IconEdit, IconTrash } from '../icons/Icons'

const inputClass =
  'w-full rounded-[9px] border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

export function CategoryFormModal({ open, onClose, onSave, initialCategory = null }) {
  const [name, setName] = useState(initialCategory?.name || '')
  const [description, setDescription] = useState(initialCategory?.description || '')

  useEffect(() => {
    if (open) {
      setName(initialCategory?.name || '')
      setDescription(initialCategory?.description || '')
    }
  }, [open, initialCategory])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onSave?.({
      id: initialCategory?.id || `cat-${Date.now()}`,
      name: trimmed,
      description: description.trim(),
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-sans text-[17px] font-bold text-slate-900">
              {initialCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">Kelola kategori buku perpustakaan.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Nama Kategori</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pendidikan"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Deskripsi singkat kategori buku..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
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

export function CategoryManagerModal({ open, categories, onClose, onCreate, onEdit, onDelete }) {
  const rows = useMemo(() => categories || [], [categories])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="font-sans text-[17px] font-bold text-slate-900">Manajemen Kategori</div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">Kelola kategori buku yang digunakan katalog.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onCreate}
              className="rounded-[9px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              + Tambah Kategori
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3.5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
                    Nama Kategori
                  </th>
                  <th className="px-3.5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
                    Deskripsi
                  </th>
                  <th className="px-3.5 py-3 text-right text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[13px] text-slate-400">
                      Belum ada kategori yang ditambahkan.
                    </td>
                  </tr>
                )}

                {rows.map((category) => (
                  <tr key={category.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-3.5 py-3 text-[12.9px] font-semibold text-slate-800">{category.name}</td>
                    <td className="px-3.5 py-3 text-[12.5px] text-slate-600">
                      {category.description || <span className="text-slate-400">Tidak ada deskripsi</span>}
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit?.(category)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(category)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryFormModal
