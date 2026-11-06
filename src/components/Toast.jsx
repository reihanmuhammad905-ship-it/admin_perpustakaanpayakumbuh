import { IconCheckCircle } from '../icons/Icons'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-7 z-[60] flex max-w-[340px] items-center gap-2.5 rounded-xl bg-slate-900 px-[18px] py-3.5 text-white shadow-2xl print:hidden">
      <IconCheckCircle className="h-[18px] w-[18px] shrink-0 text-emerald-400" />
      <span className="text-[12.8px] leading-snug">{message}</span>
    </div>
  )
}
