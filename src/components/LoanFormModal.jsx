import { MEMBERS } from '../data/members'
import { BOOKS } from '../data/books'
import { IconX } from '../icons/Icons'

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

export default function LoanFormModal({ open, onClose, onSaved }) {
  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const member = MEMBERS.find((m) => m.id === form.get('memberId'))
    const book = BOOKS.find((b) => b.id === form.get('bookId'))
    onSaved?.({
      memberName: member?.name || 'Anggota',
      bookTitle: book?.title || 'buku',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="font-sans text-[17px] font-bold text-slate-900">Catat Peminjaman Baru</div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">
              Pilih anggota dan buku untuk mencatat transaksi peminjaman.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Field label="Anggota Peminjam">
              <select name="memberId" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Pilih anggota...
                </option>
                {MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.id}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Judul Buku">
              <select name="bookId" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Pilih buku...
                </option>
                {BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Pinjam">
                <input name="borrowDate" type="date" required className={inputClass} />
              </Field>
              <Field label="Tanggal Jatuh Tempo">
                <input name="dueDate" type="date" required className={inputClass} />
              </Field>
            </div>

            <Field label="Catatan (opsional)">
              <textarea
                name="note"
                rows={2}
                placeholder="Catatan tambahan untuk transaksi ini..."
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
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
            Catat Peminjaman
          </button>
        </div>
      </form>
    </div>
  )
}
