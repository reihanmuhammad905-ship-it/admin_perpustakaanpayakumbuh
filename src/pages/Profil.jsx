import { useEffect, useRef, useState } from 'react'
import HeaderUtilities from '../components/HeaderUtilities'
import Toast from '../components/Toast'
import { IconUserCircle } from '../icons/Icons'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyProfile, updateMyProfile, changeMyPassword } from '../services/adminApi'

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-[9px] border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

function initials(name) {
  return (name || 'AD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatJoinDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function Profil() {
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const result = await getMyProfile(token)
        setProfile(result.profile)
      } catch (error) {
        setLoadError(error.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  async function handleSaveProfile(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      await updateMyProfile(token, {
        nama: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        // Field ini tidak ada di form admin, kirim balik nilai lama supaya tidak tertimpa kosong.
        gender: profile?.gender || '',
        address: profile?.address || '',
      })
      setProfile((prev) => ({ ...prev, nama: form.get('name'), email: form.get('email'), phone: form.get('phone') }))
      showToast('Perubahan profil berhasil disimpan.')
    } catch (error) {
      showToast(error.message)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const oldPassword = form.get('oldPassword')
    const newPassword = form.get('newPassword')
    const confirmPassword = form.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }

    try {
      await changeMyPassword(token, oldPassword, newPassword)
      setPasswordError('')
      e.target.reset()
      showToast('Password berhasil diubah.')
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[13px] text-slate-400">
        Memuat profil...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="max-w-sm text-[13px] text-slate-500">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-sans text-[25px] font-bold text-slate-900">Profil Saya</h1>
          <p className="mt-1.5 text-[13.5px] text-slate-500">Kelola informasi akun dan keamanan login Anda.</p>
        </div>
        <HeaderUtilities hasAlerts />
      </div>

      {/* Info card */}
      <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[26px] font-bold text-emerald-700">
          {initials(profile?.nama)}
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-bold text-slate-900">{profile?.nama}</div>
          <span className="mt-1.5 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
            Admin
          </span>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-slate-500">
            <span>{profile?.email}</span>
            {profile?.phone && <span>{profile.phone}</span>}
            <span>Bergabung sejak {formatJoinDate(profile?.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        {/* Edit profil */}
        <form
          onSubmit={handleSaveProfile}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700">
              <IconUserCircle className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Edit Profil</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">Perbarui data diri yang ditampilkan di sistem</p>
            </div>
          </div>

          <Field label="Nama Lengkap">
            <input name="name" required defaultValue={profile?.nama || ''} className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required defaultValue={profile?.email || ''} className={inputClass} />
          </Field>
          <Field label="No. Telepon">
            <input name="phone" defaultValue={profile?.phone || ''} className={inputClass} />
          </Field>

          <div className="mt-1 flex justify-end">
            <button
              type="submit"
              className="rounded-[9px] bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

        {/* Ubah password */}
        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-100 text-amber-700">
              <IconUserCircle className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Ubah Password</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">Gunakan kombinasi yang kuat dan mudah diingat</p>
            </div>
          </div>

          <Field label="Password Lama">
            <input name="oldPassword" type="password" required placeholder="••••••••" className={inputClass} />
          </Field>
          <Field label="Password Baru">
            <input name="newPassword" type="password" required placeholder="••••••••" className={inputClass} />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input name="confirmPassword" type="password" required placeholder="••••••••" className={inputClass} />
          </Field>
          {passwordError && <p className="text-[12px] font-medium text-rose-600">{passwordError}</p>}

          <div className="mt-1 flex justify-end">
            <button
              type="submit"
              className="rounded-[9px] border border-slate-300 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ubah Password
            </button>
          </div>
        </form>
      </div>

      <Toast message={toast} />
    </div>
  )
}
