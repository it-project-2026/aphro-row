# 🚀 PANDUAN DEPLOYMENT & MIGRASI APHRO ke POSTGRESQL

## 📋 TAHAP MIGRASI TERORGANISIR

### 1. DDL & Database Setup (Cloud Small V2 / Centralized PostgreSQL)
- **Host / Instance**: Cloud Small V2 PostgreSQL Instance
- **Database Name**: `Meysxysd_aphro`
- **Database User**: `meysxysd_Aphro`
- **Port**: `5432`

Jalankan skrip DDL SQL untuk membuat seluruh tabel dan indeks:
```bash
psql -h <POSTGRES_HOST> -U meysxysd_Aphro -d Meysxysd_aphro -f scripts/schema.sql
```

---

### 2. Skrip Migrasi Data dari Google Sheets ke PostgreSQL
Skrip migrasi otomatis akan mengekstrak dan memindahkan seluruh data dari Google Spreadsheet ke PostgreSQL dengan urutan berikut:

1. **UL** (Unit Layanan: UL1 Bukittinggi, UL2 Padang, UL3 Solok, UL4 Payakumbuh)
2. **Users** (Pengguna & Hak Akses)
3. **Regu** (Master Regu & Petugas)
4. **Penyulang** (Master Penyulang)
5. **Tiang** (Master Tiang)
6. **WO** (Work Orders)
7. **Realisasi** (Realisasi Pekerjaan)

#### Cara Menjalankan Migrasi Data:
```bash
export DATABASE_URL="postgresql://meysxysd_Aphro:YOUR_PASSWORD@<POSTGRES_HOST>:5432/Meysxysd_aphro"
npx tsx scripts/migrate-spreadsheet-to-postgres.ts
```

---

### 3. TAHAP 6: Migrasi GAS API -> REST API
Seluruh pemanggilan API lawas (`gasApiService.ts`) telah dialihkan dan terintegrasi secara penuh dengan REST API terpusat (`apiService.ts`):
```
React Frontend ➔ apiService.ts ➔ Node.js Express REST API (/api) ➔ PostgreSQL Database
```

---

### 4. TAHAP 7: Google Drive + Metadata Foto
Alur kerja pengunggahan foto realisasi dan absensi:
```
React ➔ API (/api) ➔ Google Drive / Cloud Storage ➔ SIMPAN METADATA (driveFileId & URL) ke PostgreSQL
```
- Metadata URL (`fotoAwalUrl`, `fotoProsesUrl`, `fotoAkhirUrl`) dan ID Drive (`driveFileIdAwal`, `driveFileIdProses`, `driveFileIdAkhir`) tersimpan permanen di tabel `Realisasi` pada database PostgreSQL.

---

### 5. TAHAP 8: Vercel + Production Topology
Arsitektur produksi:
```
Vercel (Frontend) ➔ https://api.aphro... (Backend Express REST API) ➔ Cloud Small V2 (PostgreSQL)
```

#### Environment Variables di Vercel:
```env
DATABASE_URL=postgresql://meysxysd_Aphro:YOUR_PASSWORD@<POSTGRES_HOST>:5432/Meysxysd_aphro
NODE_ENV=production
```

#### Perintah Deploy di Vercel:
```bash
vercel --prod
```
