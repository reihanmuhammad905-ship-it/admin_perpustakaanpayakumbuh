import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './Login'
import { useAuth } from '../context/AuthContext.jsx'
import { IconBook } from '../icons/Icons'

const inputClass = 'w-full rounded-[10px] border border-slate-200 bg-white px-3.5 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Admin' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
    setServerError('')
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Nama wajib diisi.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Masukkan email yang valid.'
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter.'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Konfirmasi password tidak cocok.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Buat akun admin" subtitle="Daftarkan akun untuk mengelola perpustakaan.">
      <div className="mb-7 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"><IconBook className="h-6 w-6" /></div><div><div className="text-[15px] font-bold text-slate-900">Perpustakaan</div><div className="text-[12px] font-semibold text-emerald-600">Kota Payakumbuh</div></div></div>
      <form onSubmit={submit} className="space-y-3.5">
        <Field label="Nama Lengkap" error={errors.name}><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nama lengkap" className={inputClass} /></Field>
        <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="nama@perpustakaan.go.id" className={inputClass} /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Password" error={errors.password}><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Min. 8 karakter" className={inputClass} /></Field><Field label="Konfirmasi Password" error={errors.confirmPassword}><input type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Ulangi password" className={inputClass} /></Field></div>
        <Field label="Role"><select value={form.role} onChange={(event) => update('role', event.target.value)} className={inputClass}><option value="Admin">Admin</option></select></Field>
        {serverError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-700">{serverError}</div>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-emerald-600 px-4 py-3 text-[13.5px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}{loading ? 'Mendaftarkan...' : 'Daftar dan Masuk'}</button>
      </form>
      <p className="mt-6 text-center text-[12.5px] text-slate-500">Sudah punya akun? <Link to="/login" className="font-bold text-emerald-700">Masuk di sini</Link></p>
    </AuthShell>
  )
}

function Field({ label, error, children }) { return <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-[11.5px] text-rose-600">{error}</span>}</label> }
