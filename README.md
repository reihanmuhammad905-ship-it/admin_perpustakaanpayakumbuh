# Sistem Informasi Perpustakaan Kota Payakumbuh

## Kebijakan akses e-book

Aturan akses digital terpusat berada di [src/data/ebookAccess.js](src/data/ebookAccess.js). Policy tersebut harus dijalankan oleh endpoint backend sebelum mengirim file atau konten e-book:

1. Pastikan user sudah terautentikasi.
2. Ambil transaksi berdasarkan `userId` dan `bookId` dari database.
3. Evaluasi policy menggunakan waktu server, bukan waktu dari request/browser.
4. Jika hasil `allowed` adalah `false`, kembalikan HTTP `403` dan jangan mengirim URL/file.
5. Jika transaksi mencapai atau melewati `dueDate`, transaksi diproses sebagai `Berakhir Otomatis`, stok dikembalikan satu kali, dan akses ditolak otomatis.

Contoh kontrak endpoint yang perlu diimplementasikan di backend:

```text
GET /api/user/loans/:loanId/content
Authorization: Bearer <session-token>

200 -> stream konten hanya jika policy allowed
403 -> LOAN_EXPIRED / ALREADY_RETURNED / FORBIDDEN
404 -> LOAN_NOT_FOUND
```

Workspace ini saat ini hanya berisi frontend Vite dan belum memiliki server, database, autentikasi, atau halaman User. Karena itu `localStorage` pada `loanRepository.js` hanya berfungsi sebagai fallback demo, bukan pengganti database produksi. Settlement background yang benar-benar independen dari halaman browser tetap harus dijalankan oleh worker/cron backend menggunakan waktu server `Asia/Jakarta`.

## Pengembangan

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
