import { MEMBERS } from './members.js'
import { getLoans } from './loanRepository.js'

const STORAGE_KEY = 'payakumbuh.library.members'

export function getMembers() {
  if (typeof window === 'undefined') return MEMBERS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const members = stored ? JSON.parse(stored) : MEMBERS
    return Array.isArray(members) ? members : MEMBERS
  } catch {
    return MEMBERS
  }
}

export function saveMembers(members) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
  window.dispatchEvent(new CustomEvent('library-members-updated'))
}

export function updateMemberStatus(id, status) {
  const members = getMembers().map((member) => (member.id === id ? { ...member, status } : member))
  saveMembers(members)
  return members
}

export function getMemberActivity(memberId, loans = getLoans()) {
  const memberLoans = loans.filter((loan) => loan.memberId === memberId)
  return {
    activeLoans: memberLoans.filter((loan) => loan.status === 'Dipinjam').length,
    completedLoans: memberLoans.filter((loan) => loan.status !== 'Dipinjam').length,
    loans: memberLoans,
  }
}

export function subscribeToMembers(onChange) {
  if (typeof window === 'undefined') return () => {}
  const handleChange = () => onChange(getMembers())
  window.addEventListener('storage', handleChange)
  window.addEventListener('library-members-updated', handleChange)
  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener('library-members-updated', handleChange)
  }
}
