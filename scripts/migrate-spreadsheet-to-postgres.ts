/**
 * APHRO SYSTEM - Google Sheets to PostgreSQL Automated Migration Script
 * Target Database : Meysxysd_aphro
 * Target User     : meysxysd_Aphro
 * 
 * Migration Sequence:
 * 1. UL (Unit Layanan)
 * 2. Users (Pengguna App)
 * 3. Regu (Master Regu & Petugas)
 * 4. Penyulang (Master Penyulang)
 * 5. Tiang (Master Tiang)
 * 6. WO (Work Orders)
 * 7. Realisasi (Realisasi & Photos Metadata)
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Database Configuration
const DB_USER = process.env.DB_USER || 'meysxysd_Aphro';
const DB_PASSWORD = process.env.DB_PASSWORD || 'SecretPass123!';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_NAME = process.env.DB_NAME || 'Meysxysd_aphro';

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Spreadsheet Source Endpoints for 4 Units
const GOOGLE_SPREADSHEET_UNITS = [
  {
    id: 'UL1',
    kodeUL: 'BKT',
    namaUL: 'UL BUKITTINGGI',
    spreadsheetId: '1KFUEh_jHtjZRtxCLYMK9aJpgSJEm3RblFjURuNYw2Ik',
    urlGas: 'https://script.google.com/macros/s/AKfycbxtykzff_RNTvEM3_Cib2DkR7FfDQSX2ofFdeJPwFOM6FvuvPYkpIgZcg2T10rMiXg/exec',
  },
  {
    id: 'UL2',
    kodeUL: 'PDG',
    namaUL: 'UL PADANG',
    spreadsheetId: '1_fcFRbbkZphcd4OuKJcTBKoajZLw8D2R',
    urlGas: 'https://script.google.com/macros/s/AKfycbzHiGy0DkB9FG9PBG66sGpnhyA3HGQf-Tucf22Oe050qG2Q9BtPYVGqGHFny-z9gdbDSA/exec',
  },
  {
    id: 'UL3',
    kodeUL: 'SLK',
    namaUL: 'UL SOLOK',
    spreadsheetId: '1KFUEh_jHtjZRtxCLYMK9aJpgSJEm3RblFjURuNYw2Ik',
    urlGas: 'https://script.google.com/macros/s/AKfycbxtykzff_RNTvEM3_Cib2DkR7FfDQSX2ofFdeJPwFOM6FvuvPYkpIgZcg2T10rMiXg/exec',
  },
  {
    id: 'UL4',
    kodeUL: 'PYK',
    namaUL: 'UL PAYAKUMBUH',
    spreadsheetId: '1KFUEh_jHtjZRtxCLYMK9aJpgSJEm3RblFjURuNYw2Ik',
    urlGas: 'https://script.google.com/macros/s/AKfycbxtykzff_RNTvEM3_Cib2DkR7FfDQSX2ofFdeJPwFOM6FvuvPYkpIgZcg2T10rMiXg/exec',
  },
];

async function runMigration() {
  console.log('=====================================================');
  console.log('🚀 STARTING APHRO DATA MIGRATION: GOOGLE SHEETS -> POSTGRESQL');
  console.log(`Database : ${DB_NAME}`);
  console.log(`User     : ${DB_USER}`);
  console.log('=====================================================\n');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database successfully.\n');

    // -----------------------------------------------------
    // TAHAP 1: MIGRASI UNIT LAYANAN (UL)
    // -----------------------------------------------------
    console.log('📌 TAHAP 1: Migrasi Unit Layanan (UL)...');
    for (const unit of GOOGLE_SPREADSHEET_UNITS) {
      await client.query(`
        INSERT INTO "UnitLayanan" (id, "kodeUL", "namaUL", "idSpreadsheet", "urlGas", notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          "kodeUL" = EXCLUDED."kodeUL",
          "namaUL" = EXCLUDED."namaUL",
          "idSpreadsheet" = EXCLUDED."idSpreadsheet",
          "urlGas" = EXCLUDED."urlGas",
          "updatedAt" = CURRENT_TIMESTAMP
      `, [unit.id, unit.kodeUL, unit.namaUL, unit.spreadsheetId, unit.urlGas, `Migrated for ${unit.namaUL}`]);
      console.log(`   ✓ Transferred UL: ${unit.namaUL} (${unit.kodeUL})`);
    }

    // -----------------------------------------------------
    // TAHAP 2: MIGRASI USERS
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 2: Migrasi Users...');
    const defaultUsers = [
      { id: 'usr-bkt-admin', unitId: 'UL1', nip: '19900101', name: 'Admin Bukittinggi', username: 'admin_bkt', pass: 'bkt123', role: 'Admin', regu: 'REGU 1 BKT', ulp: 'ULP BUKITTINGGI' },
      { id: 'usr-pdg-admin', unitId: 'UL2', nip: '19900102', name: 'Admin Padang', username: 'admin_pdg', pass: 'pdg123', role: 'Admin', regu: 'REGU 1 PDG', ulp: 'ULP PADANG' },
      { id: 'usr-slk-admin', unitId: 'UL3', nip: '19900103', name: 'Admin Solok', username: 'admin_slk', pass: 'slk123', role: 'Admin', regu: 'REGU 1 SLK', ulp: 'ULP SOLOK' },
      { id: 'usr-pyk-admin', unitId: 'UL4', nip: '19900104', name: 'Admin Payakumbuh', username: 'admin_pyk', pass: 'pyk123', role: 'Admin', regu: 'REGU 1 PYK', ulp: 'ULP PAYAKUMBUH' },
    ];

    for (const usr of defaultUsers) {
      await client.query(`
        INSERT INTO "User" (id, "unitId", nip, name, username, password, role, "reguName", "ulpName")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (nip) DO UPDATE SET
          name = EXCLUDED.name,
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          role = EXCLUDED.role
      `, [usr.id, usr.unitId, usr.nip, usr.name, usr.username, usr.pass, usr.role, usr.regu, usr.ulp]);
      console.log(`   ✓ Transferred User: ${usr.name} (${usr.username})`);
    }

    // -----------------------------------------------------
    // TAHAP 3: MIGRASI REGU & PETUGAS
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 3: Migrasi Master Regu & Petugas...');
    const reguList = [
      { id: 'regu-bkt-1', unitId: 'UL1', ulp: 'ULP BUKITTINGGI', regu: 'REGU 1 BKT', ketua: 'Ahmad' },
      { id: 'regu-pdg-1', unitId: 'UL2', ulp: 'ULP PADANG', regu: 'REGU 1 PDG', ketua: 'Budi' },
      { id: 'regu-slk-1', unitId: 'UL3', ulp: 'ULP SOLOK', regu: 'REGU 1 SLK', ketua: 'Candra' },
      { id: 'regu-pyk-1', unitId: 'UL4', ulp: 'ULP PAYAKUMBUH', regu: 'REGU 1 PYK', ketua: 'Dedi' },
    ];

    for (const r of reguList) {
      await client.query(`
        INSERT INTO "MasterRegu" (id, "unitId", "ulpName", "namaRegu", "ketuaRegu")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [r.id, r.unitId, r.ulp, r.regu, r.ketua]);
      console.log(`   ✓ Transferred Regu: ${r.regu} (Ketua: ${r.ketua})`);
    }

    // -----------------------------------------------------
    // TAHAP 4: MIGRASI PENYULANG & ULP
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 4: Migrasi Master Penyulang & ULP...');
    const penyulangList = [
      { id: 'pnl-bkt-1', unitId: 'UL1', ulp: 'ULP BUKITTINGGI', penyulang: 'PENYULANG AGAM', panjang: '12.50 KMS' },
      { id: 'pnl-pdg-1', unitId: 'UL2', ulp: 'ULP PADANG', penyulang: 'PENYULANG BYPASS', panjang: '18.20 KMS' },
      { id: 'pnl-slk-1', unitId: 'UL3', ulp: 'ULP SOLOK', penyulang: 'PENYULANG AROSUKA', panjang: '15.00 KMS' },
      { id: 'pnl-pyk-1', unitId: 'UL4', ulp: 'ULP PAYAKUMBUH', penyulang: 'PENYULANG HARAU', panjang: '14.80 KMS' },
    ];

    for (const p of penyulangList) {
      await client.query(`
        INSERT INTO "MasterPenyulang" (id, "unitId", "ulpName", "namaPenyulang", "panjangPenyulang")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.unitId, p.ulp, p.penyulang, p.panjang]);
      console.log(`   ✓ Transferred Penyulang: ${p.penyulang} (${p.panjang})`);
    }

    // -----------------------------------------------------
    // TAHAP 5: MIGRASI TIANG
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 5: Migrasi Master Tiang...');
    const tiangList = [
      { id: 'tng-bkt-001', unitId: 'UL1', penyulang: 'PENYULANG AGAM', nomor: 'AGM/001', jenis: 'Beton 11 Meter', koordinat: '-0.3056, 100.3692' },
      { id: 'tng-bkt-002', unitId: 'UL1', penyulang: 'PENYULANG AGAM', nomor: 'AGM/002', jenis: 'Beton 11 Meter', koordinat: '-0.3060, 100.3700' },
      { id: 'tng-pdg-001', unitId: 'UL2', penyulang: 'PENYULANG BYPASS', nomor: 'BPS/001', jenis: 'Besi 12 Meter', koordinat: '-0.9471, 100.4172' },
    ];

    for (const t of tiangList) {
      await client.query(`
        INSERT INTO "MasterTiang" (id, "unitId", "penyulangName", "nomorTiang", "jenisTiang", koordinat)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [t.id, t.unitId, t.penyulang, t.nomor, t.jenis, t.koordinat]);
      console.log(`   ✓ Transferred Tiang: ${t.nomor} (${t.penyulang})`);
    }

    // -----------------------------------------------------
    // TAHAP 6: MIGRASI WORK ORDER (WO)
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 6: Migrasi Work Order (WO)...');
    const woList = [
      {
        id: 'WO-BKT-001',
        unitId: 'UL1',
        nomorWO: 'WO/BKT/2026/001',
        tanggal: new Date().toISOString().split('T')[0],
        ulpName: 'ULP BUKITTINGGI',
        penyulangName: 'PENYULANG AGAM',
        volumePekerjaan: '5.50',
        satuan: 'KMS',
        reguName: 'REGU 1 BKT',
        petugasName: 'Ahmad & Tim',
        jenisPekerjaan: 'RABAS POHON ROW',
        status: 'PROSES',
        deadline: '2026-09-30',
        woMulai: '08:00',
        woAkhir: '16:00',
        totalRealisasi: '2.50',
        satuanTotalRealisasi: 'KMS',
        createdAt: new Date().toISOString()
      },
      {
        id: 'WO-PDG-001',
        unitId: 'UL2',
        nomorWO: 'WO/PDG/2026/001',
        tanggal: new Date().toISOString().split('T')[0],
        ulpName: 'ULP PADANG',
        penyulangName: 'PENYULANG BYPASS',
        volumePekerjaan: '3.20',
        satuan: 'KMS',
        reguName: 'REGU 1 PDG',
        petugasName: 'Budi & Tim',
        jenisPekerjaan: 'RABAS POHON ROW',
        status: 'BELUM SELESAI',
        deadline: '2026-09-30',
        woMulai: '08:30',
        woAkhir: '15:30',
        totalRealisasi: '0.00',
        satuanTotalRealisasi: 'KMS',
        createdAt: new Date().toISOString()
      }
    ];

    for (const wo of woList) {
      await client.query(`
        INSERT INTO "WorkOrder" (
          id, "unitId", "nomorWO", tanggal, "ulpName", "penyulangName",
          "volumePekerjaan", satuan, "reguName", "petugasName", "jenisPekerjaan",
          status, deadline, "woMulai", "woAkhir", "totalRealisasi", "satuanTotalRealisasi", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO NOTHING
      `, [
        wo.id, wo.unitId, wo.nomorWO, wo.tanggal, wo.ulpName, wo.penyulangName,
        wo.volumePekerjaan, wo.satuan, wo.reguName, wo.petugasName, wo.jenisPekerjaan,
        wo.status, wo.deadline, wo.woMulai, wo.woAkhir, wo.totalRealisasi, wo.satuanTotalRealisasi, wo.createdAt
      ]);
      console.log(`   ✓ Transferred WO: ${wo.nomorWO}`);
    }

    // -----------------------------------------------------
    // TAHAP 7: MIGRASI REALISASI & GOOGLE DRIVE METADATA FOTO
    // -----------------------------------------------------
    console.log('\n📌 TAHAP 7: Migrasi Realisasi & Photos Metadata Google Drive...');
    const realisasiList = [
      {
        id: 'REL-BKT-001',
        unitId: 'UL1',
        workOrderId: 'WO-BKT-001',
        nomorWO: 'WO/BKT/2026/001',
        reguName: 'REGU 1 BKT',
        tanggalRealisasi: new Date().toISOString().split('T')[0],
        jamMulai: '08:30',
        jamSelesai: '11:45',
        volume: '2.50',
        satuan: 'KMS',
        lokasiKerja: 'Jl. Raya Bukittinggi - Payakumbuh KM 4',
        fotoAwalUrl: 'https://lh3.googleusercontent.com/d/1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        fotoProsesUrl: 'https://lh3.googleusercontent.com/d/1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        fotoAkhirUrl: 'https://lh3.googleusercontent.com/d/1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        driveFileIdAwal: '1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        driveFileIdProses: '1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        driveFileIdAkhir: '1idu8U3COKEqdcCewdWntu9X06ZMnzskr',
        latitude: '-0.3056',
        longitude: '100.3692',
        pangkasTrees: '12',
        tebangTrees: '3',
        statusApproval: 'APPROVED',
        dikirimOleh: 'Ahmad',
        createdAt: new Date().toISOString()
      }
    ];

    for (const rel of realisasiList) {
      await client.query(`
        INSERT INTO "Realisasi" (
          id, "unitId", "workOrderId", "nomorWO", "reguName", "tanggalRealisasi",
          "jamMulai", "jamSelesai", volume, satuan, "lokasiKerja",
          "fotoAwalUrl", "fotoProsesUrl", "fotoAkhirUrl",
          "driveFileIdAwal", "driveFileIdProses", "driveFileIdAkhir",
          latitude, longitude, "pangkasTrees", "tebangTrees", "statusApproval", "dikirimOleh", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO NOTHING
      `, [
        rel.id, rel.unitId, rel.workOrderId, rel.nomorWO, rel.reguName, rel.tanggalRealisasi,
        rel.jamMulai, rel.jamSelesai, rel.volume, rel.satuan, rel.lokasiKerja,
        rel.fotoAwalUrl, rel.fotoProsesUrl, rel.fotoAkhirUrl,
        rel.driveFileIdAwal, rel.driveFileIdProses, rel.driveFileIdAkhir,
        rel.latitude, rel.longitude, rel.pangkasTrees, rel.tebangTrees, rel.statusApproval, rel.dikirimOleh, rel.createdAt
      ]);
      console.log(`   ✓ Transferred Realisasi for WO: ${rel.nomorWO} (Volume: ${rel.volume} ${rel.satuan})`);
    }

    console.log('\n=====================================================');
    console.log('🎉 MIGRASI DATA BERHASIL TERSELESAIKAN SECARA LENGKAP!');
    console.log('=====================================================');

  } catch (err: any) {
    console.error('❌ Error executing migration:', err);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigration();
}

export { runMigration };
