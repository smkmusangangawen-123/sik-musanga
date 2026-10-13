import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Calendar, 
  Plus, 
  MessageSquare, 
  FileSpreadsheet, 
  Eye, 
  Users, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  Clock, 
  Sparkles, 
  School,
  AlertTriangle,
  BellRing,
  Send,
  RefreshCw,
  Download,
  UserCog,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo, getDaysOverdue, createOverdueWhatsAppUrl } from '../utils/formatters';
import { downloadStudentTemplateExcel } from '../utils/exportDocs';

interface Props {
  onOpenBillingModal: () => void;
  onNavigateToReports: () => void;
  onNavigateToStudents?: () => void;
  onNavigateToUsers?: () => void;
  onOpenSchoolSettings?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ 
  onOpenBillingModal, 
  onNavigateToReports,
  onNavigateToStudents,
  onNavigateToUsers,
  onOpenSchoolSettings 
}) => {
  const { 
    bills, 
    transactions, 
    students, 
    schoolInfo,
    setSelectedReceiptTransaction, 
    setActiveWhatsAppReminder,
    setActivePaymentBill,
    checkAndTriggerOverdueAlerts,
    blastOverdueWarnings,
    lastOverdueCheck,
    exportDatabaseBackup
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'month' | 'semester' | 'all'>('month');
  const [isChecking, setIsChecking] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);

  // Metrics computation
  const totalIncome = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalReceivables = bills
    .filter(b => b.status === 'belum_lunas' || b.status === 'jatuh_tempo')
    .reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);

  const totalOverdueBills = bills.filter(b => b.status === 'jatuh_tempo');
  const totalOverdueAmount = totalOverdueBills.reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);

  const paidBillsCount = bills.filter(b => b.status === 'lunas').length;
  const totalBillsCount = bills.length;
  const complianceRate = totalBillsCount > 0 ? Math.round((paidBillsCount / totalBillsCount) * 100) : 0;

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      checkAndTriggerOverdueAlerts(true);
      setIsChecking(false);
    }, 600);
  };

  const handleBlastWarnings = () => {
    if (window.confirm(`Kirim notifikasi push darurat dan peringatan keterlambatan ke ${totalOverdueBills.length} siswa/wali murid yang menunggak?`)) {
      setIsBlasting(true);
      setTimeout(() => {
        blastOverdueWarnings();
        setIsBlasting(false);
      }, 700);
    }
  };

  const handleSendUrgentWA = (bill: typeof bills[0]) => {
    const st = students.find(s => s.id === bill.studentId);
    if (!st) return;
    const days = getDaysOverdue(bill.dueDate);
    const { url } = createOverdueWhatsAppUrl({
      phone: st.parentPhone,
      studentName: st.name,
      parentName: st.parentName,
      classGrade: st.classGrade,
      billTitle: bill.title,
      amount: bill.amount - bill.paidAmount,
      dueDate: bill.dueDate,
      daysOverdue: days,
      schoolName: schoolInfo.name
    });
    window.open(url, '_blank');
  };

  // Monthly trend data for visual interactive chart (Last 6 months)
  const monthlyData = [
    { month: 'Mei', spp: 24500000, pengembangan: 18000000 },
    { month: 'Jun', spp: 23800000, pengembangan: 15500000 },
    { month: 'Jul', spp: 31200000, pengembangan: 42000000 },
    { month: 'Agu', spp: 29500000, pengembangan: 28000000 },
    { month: 'Sep', spp: 28400000, pengembangan: 21500000 },
    { month: 'Okt', spp: 26800000, pengembangan: 19500000 },
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.spp + d.pengembangan));

  // Department breakdown
  const departmentIncome = [
    { name: 'Teknik Komputer & Jaringan (TKJ)', amount: 48500000, percent: 38, color: 'bg-emerald-500' },
    { name: 'Rekayasa Perangkat Lunak (RPL)', amount: 42100000, percent: 33, color: 'bg-blue-500' },
    { name: 'Teknik Bisnis Sepeda Motor (TBSM)', amount: 24200000, percent: 19, color: 'bg-amber-500' },
    { name: 'Akuntansi & Keuangan Lembaga (AKL)', amount: 12800000, percent: 10, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sistem Monitoring Keuangan Real-Time</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/40 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Mode Mandiri (100% Bebas API Key)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Dasbor Keuangan &amp; Pembayaran SPP
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Pantau arus kas SPP dan Uang Pengembangan secara periodik, kelola reminder WhatsApp wali murid, dan verifikasi mutasi otomatis gateway pembayaran.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
                title="Edit Nama, Alamat, dan Logo Sekolah"
              >
                <School className="w-4 h-4 text-emerald-300" />
                <span>Identitas &amp; Logo</span>
              </button>
            )}

            <button
              onClick={onOpenBillingModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan Tagihan Baru</span>
            </button>
            
            {onNavigateToStudents && (
              <button
                onClick={onNavigateToStudents}
                className="px-3.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 border border-emerald-500/30 shadow-md"
                title="Kelola Data Siswa per Kelas dan Jurusan"
              >
                <Users className="w-4 h-4 text-emerald-200" />
                <span>+ Data Siswa &amp; Kelas</span>
              </button>
            )}

            <button
              onClick={() => downloadStudentTemplateExcel(schoolInfo.name)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
              title="Unduh Format Berkas Excel Template Siswa"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Unduh Template</span>
            </button>

            <button
              onClick={exportDatabaseBackup}
              className="px-3.5 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 border border-emerald-500/40 shadow-xs"
              title="Unduh Cadangan Basis Data JSON Mandiri Tanpa API Key"
            >
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Cadangkan Data (.JSON)</span>
            </button>

            <button
              onClick={onNavigateToReports}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap Laporan</span>
            </button>

            {onNavigateToUsers && (
              <button
                onClick={onNavigateToUsers}
                className="px-3.5 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 border border-indigo-400/30 shadow-md"
                title="Kelola Akun Staf, Role & Hak Akses"
              >
                <UserCog className="w-4 h-4 text-indigo-200" />
                <span>Kelola Pengguna</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OVERDUE AUTOMATED ALERT CENTER (PUSAT PERINGATAN KETERLAMBATAN OTOMATIS) */}
      <div className={`rounded-2xl border transition-all overflow-hidden ${
        totalOverdueBills.length > 0 
          ? 'bg-gradient-to-br from-rose-50 via-white to-amber-50/40 border-rose-300 shadow-sm'
          : 'bg-emerald-50/50 border-emerald-200'
      }`}>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                totalOverdueBills.length > 0
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-4 ring-rose-100 animate-pulse'
                  : 'bg-emerald-600 text-white'
              }`}>
                {totalOverdueBills.length > 0 ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    totalOverdueBills.length > 0 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Sistem Peringatan Keterlambatan Otomatis
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sinkron: {lastOverdueCheck} WIB
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {totalOverdueBills.length > 0 
                    ? `Perhatian: ${totalOverdueBills.length} Tagihan Siswa Melewati Jatuh Tempo!` 
                    : 'Semua Kewajiban Siswa Terkendali (Tidak Ada Keterlambatan)'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {totalOverdueBills.length > 0 ? (
                    <>Total piutang jatuh tempo: <strong className="text-rose-600 font-black">{formatRupiah(totalOverdueAmount)}</strong>. Notifikasi push siswa &amp; pesan darurat WA siap dikirimkan.</>
                  ) : (
                    'Sistem secara otomatis memonitor batas waktu pembayaran SPP dan uang pengembangan setiap hari.'
                  )}
                </p>
              </div>
            </div>

            {/* Overdue Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isChecking}
                onClick={handleManualCheck}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                title="Pindai ulang seluruh tagihan untuk mendeteksi jatuh tempo terkini"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isChecking ? 'Memindai...' : 'Cek Status Sekarang'}</span>
              </button>

              {totalOverdueBills.length > 0 && (
                <button
                  type="button"
                  disabled={isBlasting}
                  onClick={handleBlastWarnings}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 active:scale-95 rounded-xl transition-all shadow-md shadow-rose-600/25 flex items-center gap-1.5 disabled:opacity-50"
                  title="Kirim notifikasi peringatan push darurat ke semua siswa yang terlambat"
                >
                  <BellRing className={`w-3.5 h-3.5 ${isBlasting ? 'animate-bounce' : ''}`} />
                  <span>{isBlasting ? 'Mengirim Peringatan...' : 'Kirim Peringatan Massal (Push & WA)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Overdue Students Details Box (If there are overdue bills) */}
          {totalOverdueBills.length > 0 && (
            <div className="mt-5 pt-4 border-t border-rose-200/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wide">
                  Daftar Siswa Terlambat Bayar Perlu Tindak Lanjut:
                </span>
                {totalOverdueBills.length > 3 && (
                  <button
                    onClick={() => setShowAllOverdue(!showAllOverdue)}
                    className="text-rose-700 hover:text-rose-900 font-bold underline"
                  >
                    {showAllOverdue ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${totalOverdueBills.length} Siswa)`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showAllOverdue ? totalOverdueBills : totalOverdueBills.slice(0, 3)).map(bill => {
                  const student = students.find(s => s.id === bill.studentId);
                  const days = getDaysOverdue(bill.dueDate);
                  const remaining = bill.amount - bill.paidAmount;

                  return (
                    <div 
                      key={bill.id} 
                      className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-xs flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Terlambat {days > 0 ? `${days} Hari` : 'Hari Ini'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Tempo: {formatDateIndo(bill.dueDate)}
                          </span>
                        </div>
                        
                        <div className="font-bold text-xs text-slate-900 mt-2 truncate">
                          {student?.name || bill.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Kelas {bill.classGrade} • Wali: {student?.parentName || '-'}
                        </div>
                        
                        <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-[11px] text-slate-600 font-medium">{bill.title}</span>
                          <span className="text-xs font-black text-rose-600">{formatRupiah(remaining)}</span>
                        </div>
                      </div>

                      {/* Action buttons per student */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleSendUrgentWA(bill)}
                          className="flex-1 py-1.5 px-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                          title="Kirim Peringatan Resmi via WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Peringatan WA</span>
                        </button>

                        <button
                          onClick={() => setActivePaymentBill(bill)}
                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Buka Payment Gateway untuk Pembayaran"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Bayar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Periode Pemantauan Kas:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'today' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'month' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini (Okt 2024)
          </button>
          <button
            onClick={() => setPeriod('semester')}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'semester' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester Ganjil
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'all' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua (T.A 2024/2025)
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pemasukan Masuk
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {formatRupiah(totalIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.8% dibanding bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Total Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Piutang &amp; Tunggakan
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {formatRupiah(totalReceivables)}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Termasuk {totalOverdueBills.length} tagihan jatuh tempo
            </div>
          </div>
        </div>

        {/* Overdue Total Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tunggakan Jatuh Tempo
            </span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">
              {formatRupiah(totalOverdueAmount)}
            </div>
            <div className="text-xs text-rose-700 font-medium mt-2 flex items-center gap-1">
              <span>Perlu pengingat WhatsApp segera</span>
            </div>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tingkat Kepatuhan Siswa
            </span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900">
                {complianceRate}%
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {paidBillsCount} / {totalBillsCount} Tagihan
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${complianceRate}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Visual Charts & Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Visualization Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Grafik Visualisasi Tren Pemasukan Sekolah
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan pemasukan SPP Bulanan vs Uang Pengembangan (dalam Juta Rupiah)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-emerald-600"></span>
                SPP Bulanan
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-teal-400"></span>
                Uang Pengembangan
              </span>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-64 w-full flex items-end gap-4 sm:gap-8 pt-8 pb-4 px-2 border-b border-slate-200">
            {monthlyData.map((item, idx) => {
              const totalMonth = item.spp + item.pengembangan;
              const heightPercent = Math.round((totalMonth / maxVal) * 85);
              const sppPercent = Math.round((item.spp / totalMonth) * 100);
              const pengPercent = 100 - sppPercent;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  
                  {/* Hover tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg p-1.5 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <div>SPP: {formatRupiah(item.spp)}</div>
                    <div>Pengembangan: {formatRupiah(item.pengembangan)}</div>
                  </div>

                  {/* Stacked bar */}
                  <div 
                    className="w-full max-w-[44px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-slate-100 transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div 
                      className="w-full bg-teal-400" 
                      style={{ height: `${pengPercent}%` }} 
                      title={`Uang Pengembangan: ${formatRupiah(item.pengembangan)}`}
                    />
                    <div 
                      className="w-full bg-emerald-600" 
                      style={{ height: `${sppPercent}%` }} 
                      title={`SPP: ${formatRupiah(item.spp)}`}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-600 mt-2">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span>Rata-rata pemasukan: ~Rp 48.000.000 / bulan</span>
            <span className="font-semibold text-emerald-700">Puncak Pemasukan: Juli (Awal Tahun Ajaran Baru)</span>
          </div>
        </div>

        {/* Breakdown by Major / Jurusan (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Pemasukan per Jurusan</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Kontribusi dana SPP &amp; sarana prasarana per kompetensi keahlian
            </p>

            <div className="space-y-4">
              {departmentIncome.map((dept, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="font-bold text-slate-900">{dept.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${dept.color} h-full rounded-full`} style={{ width: `${dept.percent}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 text-right">
                    {formatRupiah(dept.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Siswa Terdaftar:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {students.length} Siswa Aktif
            </span>
          </div>
        </div>

      </div>

      {/* Real-Time Transactions & Priority Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Transactions Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Riwayat Transaksi Real-Time
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mutasi masuk otomatis terverifikasi sistem &amp; gateway pembayaran
              </p>
            </div>
            <button
              onClick={onNavigateToReports}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Semua Transaksi &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Waktu &amp; No. Kwitansi</th>
                  <th className="py-2.5 px-3">Siswa &amp; Kelas</th>
                  <th className="py-2.5 px-3">Tagihan</th>
                  <th className="py-2.5 px-3">Kanal Pembayaran</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map(trx => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{trx.receiptNumber}</div>
                      <div className="text-[10px] text-slate-400">{formatDateIndo(trx.paidAt, true)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{trx.studentName}</div>
                      <div className="text-[10px] text-slate-500">{trx.classGrade}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {trx.billTitle}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[130px]">{trx.channelName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {formatRupiah(trx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedReceiptTransaction(trx)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat / Cetak Kwitansi Resmi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority WhatsApp Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900 text-base">Pengingat WhatsApp</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                {totalOverdueBills.length} Perlu Follow-up
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Kirim template tagihan resmi langsung ke WhatsApp wali murid dalam 1-klik.
            </p>

            <div className="space-y-3">
              {totalOverdueBills.slice(0, 4).map(bill => {
                const st = students.find(s => s.id === bill.studentId);
                if (!st) return null;
                return (
                  <div key={bill.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{st.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {bill.title} • <span className="text-rose-600 font-semibold">{formatRupiah(bill.amount - bill.paidAmount)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Wali: {st.parentName} ({st.parentPhone})
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveWhatsAppReminder({ student: st, bill })}
                      className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                      title="Kirim Pesan Pengingat WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ingatkan</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onNavigateToReports}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Lihat Rekap Tunggakan Per Kelas &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
