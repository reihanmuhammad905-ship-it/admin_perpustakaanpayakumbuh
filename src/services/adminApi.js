export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const method = options.method || 'GET'
  console.log('[adminApi] ->', method, url, '(API_BASE:', JSON.stringify(API_BASE) + ')')

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
  } catch (networkError) {
    console.error('[adminApi] gagal terhubung ->', method, url, networkError)
    throw new Error(`Tidak bisa terhubung ke backend di ${API_BASE}. Pastikan server backend sudah berjalan di alamat tersebut.`)
  }

  console.log('[adminApi] <-', response.status, url)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(getApiErrorMessage(payload, response.status))
  return payload
}

function getApiErrorMessage(payload, status) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
  if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error
  if (typeof payload?.detail === 'string' && payload.detail.trim()) return payload.detail
  if (Array.isArray(payload?.errors) && payload.errors.length) {
    return payload.errors.map((error) => (typeof error === 'string' ? error : error.message || error.msg || JSON.stringify(error))).join(', ')
  }
  return `Permintaan gagal (${status}).`
}

export function adminLogin(data) { return request('/api/admin/login', { method: 'POST', body: JSON.stringify(data) }) }
export function adminRegister(data) { return request('/api/admin/register', { method: 'POST', body: JSON.stringify(data) }) }

export function authHeaders(token) { return token ? { Authorization: `Bearer ${token}` } : {} }

export async function authenticatedRequest(path, token, options = {}) {
  return request(path, { ...options, headers: { ...authHeaders(token), ...(options.headers || {}) } })
}

// ===== Kategori =====
export function getCategories(token) {
  return authenticatedRequest('/api/admin/categories', token)
}
export function createCategory(token, data) {
  return authenticatedRequest('/api/admin/categories', token, { method: 'POST', body: JSON.stringify(data) })
}
export function updateCategory(token, id, data) {
  return authenticatedRequest(`/api/admin/categories/${id}`, token, { method: 'PUT', body: JSON.stringify(data) })
}
export function deleteCategory(token, id) {
  return authenticatedRequest(`/api/admin/categories/${id}`, token, { method: 'DELETE' })
}

// ===== Buku =====
export function getAdminBooks(token) {
  return authenticatedRequest('/api/admin/books', token)
}
export function createBook(token, data) {
  return authenticatedRequest('/api/admin/books', token, { method: 'POST', body: JSON.stringify(data) })
}
export function updateBook(token, id, data) {
  return authenticatedRequest(`/api/admin/books/${id}`, token, { method: 'PUT', body: JSON.stringify(data) })
}
export function deleteBook(token, id) {
  return authenticatedRequest(`/api/admin/books/${id}`, token, { method: 'DELETE' })
}

export async function uploadBookCover(token, id, file) {
  const url = `${API_BASE}/api/admin/books/${id}/cover`
  const formData = new FormData()
  formData.append('cover', file)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders(token) }, // JANGAN set Content-Type di sini, browser yang atur boundary-nya
      body: formData,
    })
  } catch (networkError) {
    console.error('[adminApi] gagal terhubung ->', url, networkError)
    throw new Error(`Tidak bisa terhubung ke backend di ${API_BASE}.`)
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(getApiErrorMessage(payload, response.status))
  return payload
}

export async function uploadBookPdf(token, id, file) {
  const url = `${API_BASE}/api/admin/books/${id}/pdf`
  const formData = new FormData()
  formData.append('pdf', file)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders(token) },
      body: formData,
    })
  } catch (networkError) {
    console.error('[adminApi] gagal terhubung ->', url, networkError)
    throw new Error(`Tidak bisa terhubung ke backend di ${API_BASE}.`)
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(getApiErrorMessage(payload, response.status))
  return payload
}

// ===== Peminjaman =====
export function getAdminLoans(token) {
  return authenticatedRequest('/api/admin/loans', token)
}
export function returnLoanAdmin(token, id) {
  return authenticatedRequest(`/api/admin/loans/${id}/return`, token, { method: 'POST' })
}
export function extendLoanAdmin(token, id) {
  return authenticatedRequest(`/api/admin/loans/${id}/extend`, token, { method: 'PUT' })
}

// ===== Anggota =====
export function getAdminMembers(token) {
  return authenticatedRequest('/api/admin/members', token)
}
export function updateMemberStatusApi(token, id, status) {
  return authenticatedRequest(`/api/admin/members/${id}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// ===== Laporan =====
export function getAdminReports(token, range) {
  return authenticatedRequest(`/api/admin/reports?range=${range}`, token)
}

// ===== Profil (pakai ulang endpoint /api/profile yang sama dengan APK) =====
export function getMyProfile(token) {
  return authenticatedRequest('/api/profile', token)
}
export function updateMyProfile(token, data) {
  return authenticatedRequest('/api/profile', token, { method: 'PUT', body: JSON.stringify(data) })
}
export function changeMyPassword(token, oldPassword, newPassword) {
  return authenticatedRequest('/api/profile/password', token, {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  })
}

// ===== Pengaturan Sistem =====
export function getSettingsApi(token) {
  return authenticatedRequest('/api/admin/settings', token)
}
export function updateSettingsApi(token, data) {
  return authenticatedRequest('/api/admin/settings', token, { method: 'PUT', body: JSON.stringify(data) })
}
export function getAdminAdmins(token) {
  return authenticatedRequest('/api/admin/admins', token)
}