import React, { useState } from 'react';
import { X, PlusCircle, Calendar, Layers, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { students, generateMonthlyBillsForClass, createBill } = useApp();
  const [mode, setMode] = useState<'batch_spp' | 'single_custom'>('batch_spp');

  // Batch SPP state
  const [targetClass, setTargetClass] = useState<string>('Semua');
  const [targetMonth, setTargetMonth] = useState<string>('November 2024');
  const [batchAmount, setBatchAmount] = useState<number>(250000);
  const [dueDate, setDueDate] = useState<string>('2024-11-10');

  // Single bill state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [singleTitle, setSingleTitle] = useState<string>('Uang Pengembangan - Angsuran Khusus');
  const [singleType, setSingleType] = useState<'spp' | 'uang_pengembangan' | 'ujian' | 'kegiatan'>('uang_pengembangan');
  const [singleAmount, setSingleAmount] = useState<number>(500000);
  const [singleDueDate, setSingleDueDate] = useState<string>('2024-11-20');

  if (!isOpen) return null;

  // Extract distinct classes
  const classList = ['Semua', ...Array.from(new Set(students.map(s => s.classGrade)))];

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMonthlyBillsForClass(targetMonth, dueDate, targetClass, batchAmount);
    onClose();
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    createBill({
      studentId: st.id,
      studentName: st.name,
      classGrade: st.classGrade,
      title: singleTitle,
      type: singleType,
      academicYear: '2024/2025',
      amount: singleAmount,
      dueDate: singleDueDate,
      month: singleType === 'spp' ? targetMonth : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-md">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Administrasi Keuangan
              </span>
              <h2 className="text-lg font-bold text-white">Penerbitan Tagihan Siswa</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('batch_spp')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'batch_spp'
                ? 'bg-white shadow text-emerald-700 font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Generate Massal SPP Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('single_custom')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'single_custom'
                ? 'bg-white shadow text-emerald-700 font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tagihan Khusus Per Siswa</span>
          </button>
        </div>

        {/* Body */}
        {mode === 'batch_spp' ? (
          <form onSubmit={handleBatchSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sasaran Kelas
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'Semua' ? 'Semua Kelas (Seluruh Siswa Aktif)' : `Kelas ${cls}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bulan Tagihan
                </label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="November 2024">November 2024</option>
                  <option value="Desember 2024">Desember 2024</option>
                  <option value="Januari 2025">Januari 2025</option>
                  <option value="Februari 2025">Februari 2025</option>
                  <option value="Maret 2025">Maret 2025</option>
                  <option value="April 2025">April 2025</option>
                  <option value="Mei 2025">Mei 2025</option>
                  <option value="Juni 2025">Juni 2025</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tanggal Jatuh Tempo
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nominal SPP Default (IDR)
              </label>
              <input
                type="number"
                step="5000"
                value={batchAmount}
                onChange={(e) => setBatchAmount(Number(e.target.value))}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Terformat: {formatRupiah(batchAmount)}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
              💡 Sistem akan secara otomatis menerbitkan invoice SPP baru dan menyiapkan reminder WhatsApp bagi siswa yang belum lunas.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Terbitkan Tagihan Massal</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSingleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Siswa
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classGrade} - NISN: {s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="uang_pengembangan">Uang Pengembangan</option>
                  <option value="spp">SPP Bulanan</option>
                  <option value="ujian">Biaya Ujian / Praktik</option>
                  <option value="kegiatan">Kegiatan / Kunjungan Industri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={singleDueDate}
                  onChange={(e) => setSingleDueDate(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Judul Tagihan
              </label>
              <input
                type="text"
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
                placeholder="Contoh: Uang Pengembangan - Tahap 3 (Pelunasan)"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nominal Tagihan (IDR)
              </label>
              <input
                type="number"
                step="50000"
                value={singleAmount}
                onChange={(e) => setSingleAmount(Number(e.target.value))}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Terformat: {formatRupiah(singleAmount)}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Tagihan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
