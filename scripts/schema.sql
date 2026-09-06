-- =========================================================================
-- APHRO SYSTEM - POSTGRESQL DATABASE INITIALIZATION SCHEMA
-- Target Database : Meysxysd_aphro
-- Target Owner    : meysxysd_Aphro
-- Generated for Cloud Small V2 / Centralized PostgreSQL Production Instance
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: UnitLayanan (UL)
CREATE TABLE IF NOT EXISTS "UnitLayanan" (
  "id" VARCHAR(64) PRIMARY KEY,
  "kodeUL" VARCHAR(32) NOT NULL UNIQUE,
  "namaUL" VARCHAR(128) NOT NULL,
  "idSpreadsheet" VARCHAR(256),
  "urlGas" VARCHAR(512),
  "folderIdSpreadsheet" VARCHAR(256),
  "folderIdFoto" VARCHAR(256),
  "folderIdAbsensi" VARCHAR(256),
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: User (Pengguna)
CREATE TABLE IF NOT EXISTS "User" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) REFERENCES "UnitLayanan"("id") ON DELETE SET NULL,
  "nip" VARCHAR(64) NOT NULL UNIQUE,
  "name" VARCHAR(128) NOT NULL,
  "username" VARCHAR(64) NOT NULL UNIQUE,
  "password" VARCHAR(256) NOT NULL,
  "role" VARCHAR(32) DEFAULT 'User',
  "reguName" VARCHAR(128),
  "ulpName" VARCHAR(128),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_user_unit" ON "User"("unitId");
CREATE INDEX IF NOT EXISTS "idx_user_username" ON "User"("username");

-- 3. Table: MasterRegu (Regu & Petugas)
CREATE TABLE IF NOT EXISTS "MasterRegu" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "ulpName" VARCHAR(128) NOT NULL,
  "namaRegu" VARCHAR(128) NOT NULL,
  "ketuaRegu" VARCHAR(128),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_regu_unit" ON "MasterRegu"("unitId");

CREATE TABLE IF NOT EXISTS "MasterPetugas" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "reguName" VARCHAR(128) NOT NULL,
  "namaPetugas" VARCHAR(128) NOT NULL,
  "jabatan" VARCHAR(64),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_petugas_unit" ON "MasterPetugas"("unitId");

-- 4. Table: MasterPenyulang (Penyulang & ULP)
CREATE TABLE IF NOT EXISTS "MasterULP" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "kodeULP" VARCHAR(32) NOT NULL,
  "namaULP" VARCHAR(128) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_ulp_unit" ON "MasterULP"("unitId");

CREATE TABLE IF NOT EXISTS "MasterPenyulang" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "ulpName" VARCHAR(128) NOT NULL,
  "namaPenyulang" VARCHAR(128) NOT NULL,
  "panjangPenyulang" VARCHAR(64),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_penyulang_unit" ON "MasterPenyulang"("unitId");

-- 5. Table: MasterTiang (Tiang)
CREATE TABLE IF NOT EXISTS "MasterTiang" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "penyulangName" VARCHAR(128) NOT NULL,
  "nomorTiang" VARCHAR(64) NOT NULL,
  "jenisTiang" VARCHAR(64),
  "koordinat" VARCHAR(128),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_tiang_unit" ON "MasterTiang"("unitId");
CREATE INDEX IF NOT EXISTS "idx_tiang_nomor" ON "MasterTiang"("nomorTiang");

-- 6. Table: WorkOrder (WO)
CREATE TABLE IF NOT EXISTS "WorkOrder" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "nomorWO" VARCHAR(128) NOT NULL,
  "tanggal" VARCHAR(32) NOT NULL,
  "ulpName" VARCHAR(128) NOT NULL,
  "penyulangName" VARCHAR(128) NOT NULL,
  "volumePekerjaan" VARCHAR(32) NOT NULL,
  "satuan" VARCHAR(32) NOT NULL,
  "reguName" VARCHAR(128) NOT NULL,
  "petugasName" VARCHAR(128),
  "jenisPekerjaan" VARCHAR(128),
  "status" VARCHAR(32) DEFAULT 'BELUM SELESAI',
  "deadline" VARCHAR(32),
  "woMulai" VARCHAR(32),
  "woAkhir" VARCHAR(32),
  "totalRealisasi" VARCHAR(32) DEFAULT '0.00',
  "satuanTotalRealisasi" VARCHAR(32),
  "lokasiStart" VARCHAR(128),
  "lokasiFinish" VARCHAR(128),
  "createdAt" VARCHAR(64) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_wo_unit" ON "WorkOrder"("unitId");
CREATE INDEX IF NOT EXISTS "idx_wo_nomor" ON "WorkOrder"("nomorWO");
CREATE INDEX IF NOT EXISTS "idx_wo_regu" ON "WorkOrder"("reguName");

-- 7. Table: Realisasi (Realisasi Pekerjaan + Metadata Foto Google Drive)
CREATE TABLE IF NOT EXISTS "Realisasi" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "workOrderId" VARCHAR(64) REFERENCES "WorkOrder"("id") ON DELETE SET NULL,
  "nomorWO" VARCHAR(128) NOT NULL,
  "reguName" VARCHAR(128) NOT NULL,
  "tanggalRealisasi" VARCHAR(32) NOT NULL,
  "jamMulai" VARCHAR(32),
  "jamSelesai" VARCHAR(32),
  "volume" VARCHAR(32) DEFAULT '0.00',
  "satuan" VARCHAR(32) NOT NULL,
  "lokasiKerja" VARCHAR(256),
  "fotoAwalUrl" TEXT,
  "fotoProsesUrl" TEXT,
  "fotoAkhirUrl" TEXT,
  "fotoTambahanUrl" TEXT,
  "driveFileIdAwal" VARCHAR(256),
  "driveFileIdProses" VARCHAR(256),
  "driveFileIdAkhir" VARCHAR(256),
  "latitude" VARCHAR(64),
  "longitude" VARCHAR(64),
  "pangkasTrees" VARCHAR(32) DEFAULT '0',
  "tebangTrees" VARCHAR(32) DEFAULT '0',
  "tglMulai" VARCHAR(32),
  "tglSelesai" VARCHAR(32),
  "statusApproval" VARCHAR(32) DEFAULT 'PENDING',
  "dikirimOleh" VARCHAR(128),
  "createdAt" VARCHAR(64) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_realisasi_unit" ON "Realisasi"("unitId");
CREATE INDEX IF NOT EXISTS "idx_realisasi_nomorwo" ON "Realisasi"("nomorWO");

-- 8. Table: Absensi
CREATE TABLE IF NOT EXISTS "Absensi" (
  "id" VARCHAR(64) PRIMARY KEY,
  "unitId" VARCHAR(64) NOT NULL REFERENCES "UnitLayanan"("id") ON DELETE CASCADE,
  "reguName" VARCHAR(128) NOT NULL,
  "ulpName" VARCHAR(128),
  "tanggal" VARCHAR(32) NOT NULL,
  "jamMasuk" VARCHAR(32),
  "jamKeluar" VARCHAR(32),
  "fotoAbsensiUrl" TEXT,
  "driveFileIdAbsensi" VARCHAR(256),
  "jumlahPersonel" INT DEFAULT 0,
  "daftarPersonel" TEXT,
  "status" VARCHAR(32) DEFAULT 'HADIR',
  "createdAt" VARCHAR(64) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_absensi_unit" ON "Absensi"("unitId");
CREATE INDEX IF NOT EXISTS "idx_absensi_tanggal" ON "Absensi"("tanggal");

-- Grant Permissions to User meysxysd_Aphro
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "meysxysd_Aphro";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "meysxysd_Aphro";
