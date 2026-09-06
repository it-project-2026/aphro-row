import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import {
  Database,
  RefreshCw,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  HardDrive,
  Users,
  Briefcase,
  Check,
  Terminal,
} from 'lucide-react';

interface PostgresMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostgresMigrationModal: React.FC<PostgresMigrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [isInitializingSchema, setIsInitializingSchema] = useState(false);
  const [isMigratingData, setIsMigratingData] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);
  const [schemaSuccess, setSchemaSuccess] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await ApiService.getDatabaseStats();
      if (res && res.status === 'success') {
        setStats(res);
      }
    } catch (err: any) {
      console.error('Error fetching DB stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitSchema = async () => {
    setIsInitializingSchema(true);
    setLogs(['[Mulai] Memproses Pembentukan Database & Schema PostgreSQL...']);
    setSchemaSuccess(false);

    try {
      const res = await ApiService.initDatabaseSchema();
      if (res && res.status === 'success') {
        if (res.logs) {
          setLogs((prev) => [...prev, ...res.logs]);
        }
        setSchemaSuccess(true);
        showToast('Schema Database "Meysxysd_aphro" Berhasil Dibentuk Lengkap!', 'success');
        fetchStats();
      } else {
        showToast(`Gagal inisialisasi schema: ${res.message || 'Error'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error Inisialisasi: ${err.message}`, 'error');
    } finally {
      setIsInitializingSchema(false);
    }
  };

  const handleRunMigration = async () => {
    setIsMigratingData(true);
    setLogs(['[Mulai Eksekusi] Memulai Migrasi Data Google Sheets -> PostgreSQL...']);
    setMigrationSuccess(false);

    try {
      const res = await ApiService.migrateFromSpreadsheet();
      if (res && res.status === 'success') {
        if (res.logs) {
          setLogs((prev) => [...prev, ...res.logs]);
        }
        setMigrationSuccess(true);
        showToast('Migrasi Data dari Spreadsheet ke PostgreSQL Selesai 100%!', 'success');
        fetchStats();
      } else {
        showToast(`Gagal migrasi data: ${res.message || 'Error'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error Migrasi: ${err.message}`, 'error');
    } finally {
      setIsMigratingData(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Pusat Migrasi PostgreSQL
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  PostgreSQL Direct
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Inisialisasi Database & Migrasi 7 Tahap dari Google Sheets ke PostgreSQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Specs Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Nama Database Target
              </div>
              <div className="text-sm font-bold text-blue-400 font-mono">Meysxysd_aphro</div>
              <div className="text-[11px] text-slate-500 mt-1">PostgreSQL Database</div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                User PostgreSQL
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">meysxysd_Aphro</div>
              <div className="text-[11px] text-slate-500 mt-1">Full ALL PRIVILEGES Owner</div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                Host / Topology
              </div>
              <div className="text-sm font-bold text-purple-300">Cloud Small V2</div>
              <div className="text-[11px] text-slate-500 mt-1">Centralized Node.js REST API</div>
            </div>
          </div>

          {/* Database Statistics */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Status Record Tabel Database
              </h4>
              <button
                onClick={fetchStats}
                disabled={loadingStats}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                Segarkan Status
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Unit Layanan</div>
                <div className="text-base font-bold text-slate-100">{stats?.counts?.units ?? 4}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Pengguna (Users)</div>
                <div className="text-base font-bold text-slate-100">{stats?.counts?.users ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Master Regu</div>
                <div className="text-base font-bold text-slate-100">{stats?.counts?.regu ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Master Penyulang</div>
                <div className="text-base font-bold text-slate-100">{stats?.counts?.penyulang ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Work Orders</div>
                <div className="text-base font-bold text-blue-400">{stats?.counts?.workOrders ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Realisasi</div>
                <div className="text-base font-bold text-emerald-400">{stats?.counts?.realisasi ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Absensi</div>
                <div className="text-base font-bold text-amber-400">{stats?.counts?.absensi ?? 0}</div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <div className="text-xs text-slate-400">Log Aktivitas</div>
                <div className="text-base font-bold text-slate-100">{stats?.counts?.logs ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Action Execution Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Aksi Eksekusi Migrasi Sistem
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Init Database & Schema */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/40">
                      1
                    </span>
                    <h5 className="text-sm font-bold text-slate-100">
                      Inisialisasi Database & Schema SQL
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Membentuk struktur database <span className="font-mono text-blue-300">Meysxysd_aphro</span>, 8 tabel relasional, constraint NIP/Username, dan indeks kueri.
                  </p>
                </div>

                <button
                  onClick={handleInitSchema}
                  disabled={isInitializingSchema || isMigratingData}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isInitializingSchema ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Membentuk Schema Database...
                    </>
                  ) : schemaSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Schema Berhasil Dibentuk!
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Bentuk Schema Database
                    </>
                  )}
                </button>
              </div>

              {/* Step 2: Migrate Spreadsheet -> PostgreSQL */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/40">
                      2
                    </span>
                    <h5 className="text-sm font-bold text-slate-100">
                      Migrasi Data Spreadsheet ➔ PostgreSQL
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mengekstrak dan mengimpor data Google Sheets (UL, Users, Regu, Penyulang, Tiang, WO, Realisasi & Drive Photos) ke PostgreSQL.
                  </p>
                </div>

                <button
                  onClick={handleRunMigration}
                  disabled={isInitializingSchema || isMigratingData}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isMigratingData ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memproses Migrasi 7 Tahap...
                    </>
                  ) : migrationSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      Migrasi Data 100% Selesai
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Jalankan Migrasi Data (7 Tahap)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Migration Steps Pipeline Graphic */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Urutan Tahapan Migrasi Data Terstruktur
            </h5>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">1. UL</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">2. Users</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">3. Regu</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">4. Penyulang</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">5. Tiang</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-slate-800 text-blue-300 rounded border border-slate-700">6. WO</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 bg-emerald-900/60 text-emerald-300 rounded border border-emerald-700/80 font-bold">7. Realisasi</span>
            </div>
          </div>

          {/* Terminal / Execution Console Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Console Log Eksekusi Real-time
              </span>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Bersihkan Log
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400/90 h-48 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">
                  Siap untuk inisialisasi schema atau migrasi data...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Terhubung ke PostgreSQL Database <strong className="text-slate-200 font-mono">Meysxysd_aphro</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs rounded-lg transition-colors"
          >
            Tutup Modal
          </button>
        </div>
      </div>
    </div>
  );
};
