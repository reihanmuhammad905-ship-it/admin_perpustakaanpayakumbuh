const EMERALD = [5, 150, 105]
const SLATE_900 = [15, 23, 42]
const SLATE_500 = [100, 116, 139]
const SLATE_200 = [226, 232, 240]

function pad2(value) {
  return String(value).padStart(2, '0')
}

export function fileDateStamp(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function printDateLabel(date = new Date()) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ensureSpace(doc, y, needed) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - 50) {
    doc.addPage()
    return 50
  }
  return y
}

function sectionHeading(doc, text, y, margin) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(...SLATE_900)
  doc.text(text, margin, y)
  return y + 14
}

export async function buildReportPdf(report, rangeLabel) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 46

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...EMERALD)
  doc.text('Perpustakaan Payakumbuh', margin, y)

  y += 20
  doc.setFontSize(12.5)
  doc.setTextColor(...SLATE_900)
  doc.text('Laporan & Analitik', margin, y)

  y += 17
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...SLATE_500)
  doc.text(`Periode: ${rangeLabel}`, margin, y)
  doc.text(`Tanggal cetak: ${printDateLabel()}`, pageWidth - margin, y, { align: 'right' })

  y += 12
  doc.setDrawColor(...SLATE_200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 22

  y = sectionHeading(doc, 'Ringkasan Statistik', y, margin)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Metrik', 'Nilai', 'Perubahan']],
    body: report.cards.map((card) => [
      card.label,
      card.value,
      `${card.direction === 'up' ? '+' : '-'}${card.change}%`,
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: SLATE_900 },
  })
  y = doc.lastAutoTable.finalY + 26

  y = ensureSpace(doc, y, 60)
  y = sectionHeading(doc, 'Buku Paling Sering Dipinjam', y, margin)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Judul Buku', 'Kategori', 'Dipinjam', 'Stok']],
    body: report.popularBooks.map((book) => [
      book.rank,
      book.title,
      book.category,
      `${book.borrowed}x`,
      `${book.stock} unit`,
    ]),
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 5.5 },
    headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: SLATE_900 },
    columnStyles: { 0: { cellWidth: 26 }, 3: { cellWidth: 60 }, 4: { cellWidth: 60 } },
  })
  y = doc.lastAutoTable.finalY + 26

  y = ensureSpace(doc, y, 60)
  y = sectionHeading(doc, 'Anggota Paling Aktif', y, margin)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Nama', 'ID Anggota', 'Total Pinjam', 'Sedang Dipinjam', 'Poin Literasi']],
    body: report.activeMembers.map((member) => [
      member.name,
      member.memberId,
      `${member.total} buku`,
      `${member.active} buku`,
      `${member.points} poin`,
    ]),
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 5.5 },
    headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: SLATE_900 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...SLATE_500)
    doc.text('Dicetak dari Sistem Perpustakaan Payakumbuh', margin, pageHeight - 24)
    doc.text(`Halaman ${page} dari ${pageCount}`, pageWidth - margin, pageHeight - 24, { align: 'right' })
  }

  return doc
}

export async function downloadReportPdf(report, rangeLabel) {
  const doc = await buildReportPdf(report, rangeLabel)
  doc.save(`laporan-perpustakaan-${fileDateStamp()}.pdf`)
}

export async function downloadReportExcel(report, rangeLabel) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Laporan & Analitik - Perpustakaan Payakumbuh'],
    [`Periode: ${rangeLabel}`],
    [`Tanggal ekspor: ${printDateLabel()}`],
    [],
    ['Metrik', 'Nilai', 'Perubahan (%)', 'Arah'],
    ...report.cards.map((card) => [card.label, card.value, card.change, card.direction === 'up' ? 'Naik' : 'Turun']),
  ])
  summarySheet['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')

  const trendSheet = XLSX.utils.aoa_to_sheet([
    ['Bulan', 'Peminjaman', 'Pengembalian'],
    ...report.monthlyTrend.map((row) => [row.month, row.loans, row.returns]),
  ])
  trendSheet['!cols'] = [{ wch: 10 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(workbook, trendSheet, 'Tren Bulanan')

  const booksSheet = XLSX.utils.aoa_to_sheet([
    ['Peringkat', 'Judul Buku', 'Kategori', 'Jumlah Dipinjam', 'Stok Tersedia'],
    ...report.popularBooks.map((book) => [book.rank, book.title, book.category, book.borrowed, book.stock]),
  ])
  booksSheet['!cols'] = [{ wch: 10 }, { wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(workbook, booksSheet, 'Buku Terpopuler')

  const membersSheet = XLSX.utils.aoa_to_sheet([
    ['Nama', 'ID Anggota', 'Total Peminjaman', 'Sedang Dipinjam', 'Poin Literasi'],
    ...report.activeMembers.map((member) => [member.name, member.memberId, member.total, member.active, member.points]),
  ])
  membersSheet['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(workbook, membersSheet, 'Anggota Aktif')

  XLSX.writeFile(workbook, `laporan-perpustakaan-${fileDateStamp()}.xlsx`)
}
