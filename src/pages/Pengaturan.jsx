import { useEffect, useState } from 'react'
import HeaderUtilities from '../components/HeaderUtilities'
import Toast from '../components/Toast'
import { IconBell, IconCheckCircle, IconClock, IconDownload, IconLock, IconPlus, IconBook } from '../icons/Icons'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getSettingsApi,
  updateSettingsApi,
  getAdminAdmins,
  adminRegister,
  changeMyPassword,
} from '../services/adminApi'

const TABS = [
  ['info', 'Informasi Perpustakaan', IconBook],
  ['loans', 'Pengaturan Peminjaman', IconClock],
  ['notifications', 'Notifikasi', IconBell],
  ['security', 'Akun & Keamanan', IconLock],
  ['backup', 'Backup & Database', IconDownload],
]

function initials(name) {
  return (name || '-')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Pengaturan() {
  const { token } = useAuth()
  const [active, setActive] = useState('info')
  const [values, setValues] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState('')

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))

  function showToast(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  async function loadData() {
    setLoading(true)
    setLoadError('')
    try {
      const [settingsResult, adminsResult] = await Promise.all([getSettingsApi(token), getAdminAdmins(token)])
      setValues(settingsResult.settings)
      setAdmins(adminsResult.admins || [])
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

  async function save(label) {
    try {
      const result = await updateSettingsApi(token, values)
      setValues(result.settings)
      showToast(`${label} berhasil disimpan.`)
    } catch (error) {
      showToast(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[13px] text-slate-400">
        Memuat pengaturan...
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
          <h1 className="font-sans text-[25px] font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">
            Kelola konfigurasi umum dan kebijakan layanan perpustakaan.
          </p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[235px_minmax(0,1fr)]">
        <nav className="h-fit rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-3 text-left text-[12.5px] font-semibold ${
                active === id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          {active === 'info' && <InfoTab values={values} update={update} save={() => save('Informasi perpustakaan')} />}
          {active === 'loans' && <LoansTab values={values} update={update} save={() => save('Pengaturan peminjaman')} />}
          {active === 'notifications' && (
            <NotificationsTab values={values} update={update} save={() => save('Notifikasi')} />
          )}
          {active === 'security' && (
            <SecurityTab admins={admins} token={token} showToast={showToast} reloadAdmins={loadData} />
          )}
          {active === 'backup' && <BackupTab values={values} update={update} save={() => save('Backup')} showToast={showToast} />}
        </main>
      </div>

      <Toast message={toast} />
    </div>
  )
}

function Header({ title, description }) {
  return (
    <div className="border-b border-slate-100 px-6 py-5">
      <h2 className="text-[16px] font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-[12.5px] text-slate-500">{description}</p>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function Input({ value, onChange, type = 'text', ...props }) {
  return (
    <input
      {...props}
      type={type}
      value={value ?? ''}
      onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
      className="w-full rounded-[9px] border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
    />
  )
}

function Save({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 rounded-[9px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700"
    >
      Simpan Perubahan
    </button>
  )
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 border-b border-slate-100 py-3.5 text-left last:border-b-0"
    >
      <span>
        <span className="block text-[13px] font-semibold text-slate-700">{label}</span>
        {description && <span className="mt-0.5 block text-[11.5px] text-slate-400">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full ${checked ? 'bg-emerald-600' : 'bg-slate-300'}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function NotActiveNote({ children }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] text-amber-700">
      {children}
    </div>
  )
}

// ============ TAB: Informasi Perpustakaan ============
function InfoTab({ values, update, save }) {
  return (
    <>
      <Header title="Informasi Perpustakaan" description="Identitas yang tampil pada layanan dan komunikasi perpustakaan." />
      <div className="px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Perpustakaan">
            <Input value={values.library_name} onChange={(v) => update('library_name', v)} />
          </Field>
          <Field label="Nomor Telepon">
            <Input value={values.phone} onChange={(v) => update('phone', v)} />
          </Field>
          <Field label="Alamat" className="md:col-span-2">
            <Input value={values.address} onChange={(v) => update('address', v)} />
          </Field>
          <Field label="Email">
            <Input value={values.email} onChange={(v) => update('email', v)} />
          </Field>
          <Field label="Jam Operasional">
            <Input value={values.hours} onChange={(v) => update('hours', v)} />
          </Field>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="text-[12px] font-semibold text-slate-700">Logo Perpustakaan</div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-slate-400">
            <span>Fitur unggah logo belum tersedia</span>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-300"
            >
              Pilih File
            </button>
          </div>
        </div>

        <Save onClick={save} />
      </div>
    </>
  )
}

// ============ TAB: Pengaturan Peminjaman ============
function LoansTab({ values, update, save }) {
  return (
    <>
      <Header title="Pengaturan Peminjaman" description="Atur batas waktu dan kebijakan peminjaman anggota." />
      <div className="px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Durasi Peminjaman (hari)">
            <Input type="number" value={values.loan_duration_days} onChange={(v) => update('loan_duration_days', v)} />
          </Field>
          <Field label="Maksimal Buku per Anggota">
            <Input type="number" value={values.max_books_per_member} onChange={(v) => update('max_books_per_member', v)} />
          </Field>
        </div>

        <div className="mt-5">
          <Toggle
            label="Izinkan perpanjangan peminjaman"
            checked={values.allow_extension}
            onChange={(v) => update('allow_extension', v)}
            description="Admin dapat memperpanjang jatuh tempo dari Data Peminjaman."
          />
          <Toggle
            label="Aktifkan sistem antrian otomatis"
            checked={values.auto_queue}
            onChange={(v) => update('auto_queue', v)}
            description="Anggota bisa masuk antrian saat buku tidak tersedia."
          />
        </div>

        <NotActiveNote>
          Perubahan di halaman ini langsung berlaku untuk peminjaman baru dan aksi admin berikutnya.
        </NotActiveNote>

        <Save onClick={save} />
      </div>
    </>
  )
}

// ============ TAB: Notifikasi ============
function NotificationsTab({ values, update, save }) {
  return (
    <>
      <Header title="Notifikasi" description="Pilih pengingat yang diterima anggota dan admin." />
      <div className="px-6 py-5">
        <Toggle label="Notifikasi jatuh tempo" checked={values.notify_due} onChange={(v) => update('notify_due', v)} />
        <Toggle
          label="Notifikasi buku tersedia"
          checked={values.notify_available}
          onChange={(v) => update('notify_available', v)}
        />
        <Toggle
          label="Kirim melalui email"
          checked={values.notify_email}
          onChange={(v) => update('notify_email', v)}
          description="Selain notifikasi in-app."
        />
        <Field label="Kirim pengingat sebelum jatuh tempo (hari)" className="mt-5 max-w-[260px]">
          <Input type="number" value={values.reminder_days} onChange={(v) => update('reminder_days', v)} />
        </Field>

        <NotActiveNote>
          Preferensi ini tersimpan untuk dipakai nanti — sistem pengiriman notifikasi push/email belum aktif berjalan
          di aplikasi.
        </NotActiveNote>

        <Save onClick={save} />
      </div>
    </>
  )
}

// ============ TAB: Akun & Keamanan ============
function SecurityTab({ admins, token, showToast, reloadAdmins }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      showToast('Isi password saat ini dan password baru.')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.')
      return
    }
    try {
      await changeMyPassword(token, oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      showToast('Password berhasil diubah.')
    } catch (error) {
      showToast(error.message)
    }
  }

  return (
    <>
      <Header title="Akun & Keamanan" description="Kelola akun administrator dan keamanan akses dashboard." />
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-slate-800">Daftar Akun Admin</div>
            <div className="text-[12px] text-slate-400">Akun dengan hak akses dashboard.</div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Tambah Admin
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[520px]">
            <thead className="bg-slate-50">
              <tr>
                {['Nama', 'Email', 'Role', 'Status'].map((item) => (
                  <th key={item} className="px-3 py-2.5 text-left text-[11px] uppercase text-slate-500">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="flex items-center gap-2.5 border-t border-slate-100 px-3 py-3 text-[12.5px] font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[10.5px] font-bold text-emerald-700">
                      {initials(admin.name)}
                    </span>
                    {admin.name}
                  </td>
                  <td className="border-t border-slate-100 px-3 py-3 text-[12px] text-slate-500">{admin.email}</td>
                  <td className="border-t border-slate-100 px-3 py-3 text-[12px] text-slate-500">Admin</td>
                  <td className="border-t border-slate-100 px-3 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-[12.5px] text-slate-400">
                    Belum ada akun admin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="text-[13px] font-bold text-slate-800">Ubah Password Saya</div>
          <div className="mt-1 text-[11.5px] text-slate-400">
            Mengubah password akun admin yang sedang login saat ini.
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Password Saat Ini">
              <Input type="password" value={oldPassword} onChange={setOldPassword} placeholder="Masukkan password saat ini" />
            </Field>
            <Field label="Password Baru">
              <Input type="password" value={newPassword} onChange={setNewPassword} placeholder="Minimal 8 karakter" />
            </Field>
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-semibold"
          >
            Perbarui Password
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false)
            reloadAdmins()
            showToast('Akun admin baru berhasil dibuat.')
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}

function AddAdminModal({ onClose, onCreated, showToast }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) {
      showToast('Semua field wajib diisi.')
      return
    }
    if (password.length < 8) {
      showToast('Password minimal 8 karakter.')
      return
    }
    setSubmitting(true)
    try {
      await adminRegister({ name, email, password, role: 'Admin' })
      onCreated()
    } catch (error) {
      showToast(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-5" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="text-[16px] font-bold text-slate-900">Tambah Akun Admin</div>
        <p className="mt-1 text-[12.5px] text-slate-500">Akun baru langsung memiliki akses penuh ke dashboard ini.</p>

        <div className="mt-4 flex flex-col gap-3.5">
          <Field label="Nama Lengkap">
            <Input value={name} onChange={setName} placeholder="Nama admin" />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={setEmail} placeholder="admin@perpuspayakumbuh.id" />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={setPassword} placeholder="Minimal 8 karakter" />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[9px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? 'Menyimpan...' : 'Buat Akun'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ============ TAB: Backup & Database ============
function BackupTab({ values, update, save, showToast }) {
  return (
    <>
      <Header title="Backup & Database" description="Pastikan data perpustakaan memiliki salinan pemulihan yang aman." />
      <div className="px-6 py-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold text-slate-800">Backup Terakhir</div>
              <div className="mt-1 text-[12px] text-slate-500">Fitur backup manual/otomatis belum tersedia.</div>
            </div>
            <IconCheckCircle className="h-5 w-5 text-slate-300" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Fitur backup database belum tersedia di sistem ini.')}
          className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-500"
        >
          <IconDownload className="h-4 w-4" />
          Backup Database Sekarang
        </button>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <Toggle label="Aktifkan backup otomatis" checked={values.auto_backup} onChange={(v) => update('auto_backup', v)} />
          <Field label="Jadwal backup" className="mt-4 max-w-[260px]">
            <select
              value={values.backup_period}
              onChange={(e) => update('backup_period', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px]"
            >
              <option>Harian</option>
              <option>Mingguan</option>
            </select>
          </Field>
        </div>

        <NotActiveNote>
          Preferensi jadwal ini tersimpan, tapi proses backup otomatis ke penyimpanan lain belum diimplementasikan di
          server. Hubungi developer untuk mengaktifkan backup terjadwal sungguhan.
        </NotActiveNote>

        <Save onClick={save} />
      </div>
    </>
  )
}
