import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  MessageSquare, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  RotateCcw,
  FileDown,
  Building,
  School,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { exportReportToWord, exportReportToExcel, exportIndividualBillWord } from '../utils/exportDocs';
import { Bill } from '../types';

interface Props {
  onOpenSchoolSettings?: () => void;
}

export const ReportView: React.FC<Props> = ({ onOpenSchoolSettings }) => {
  const { 
    bills, 
    students, 
    transactions, 
    setActivePaymentBill, 
    setSelectedReceiptTransaction, 
    setActiveWhatsAppReminder,
    schoolInfo 
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState<'semua' | 'lunas' | 'belum_lunas' | 'jatuh_tempo'>('semua');
  const [selectedType, setSelectedType] = useState<'semua' | 'spp' | 'uang_pengembangan'>('semua');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Extract distinct classes from students
  const classList = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.classGrade))).sort();
    return ['Semua', ...list];
  }, [students]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Class filter
      if (selectedClass !== 'Semua' && bill.classGrade !== selectedClass) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'semua' && bill.status !== selectedStatus) {
        return false;
      }

      // Type filter
      if (selectedType !== 'semua' && bill.type !== selectedType) {
        return false;
      }

      // Search query (Student name, NISN, bill title)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const student = students.find(s => s.id === bill.studentId);
        const matchName = bill.studentName.toLowerCase().includes(q);
        const matchTitle = bill.title.toLowerCase().includes(q);
        const matchNisn = student?.nisn.includes(q);
        if (!matchName && !matchTitle && !matchNisn) return false;
      }

      return true;
    });
  }, [bills, students, selectedClass, selectedStatus, selectedType, searchQuery]);

  // Aggregate statistics for active filters
  const totalBillAmount = filteredBills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaidAmount = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalUnpaidAmount = totalBillAmount - totalPaidAmount;

  // Export handlers
  const handleExportWord = () => {
    exportReportToWord({
      bills: filteredBills,
      students,
      schoolInfo,
      filterClass: selectedClass,
      filterStatus: selectedStatus,
      filterType: selectedType
    });
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportReportToExcel({
      bills: filteredBills,
      students,
      schoolInfo,
      filterClass: selectedClass,
      filterStatus: selectedStatus,
      filterType: selectedType
    });
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Jenis Tagihan',
      'Nominal Tagihan (IDR)',
      'Terbayar (IDR)',
      'Sisa Tagihan (IDR)',
      'Jatuh Tempo',
      'Status',
      'Nama Wali',
      'No WhatsApp Wali'
    ];

    const rows = filteredBills.map((b, idx) => {
      const st = students.find(s => s.id === b.studentId);
      return [
        idx + 1,
        st?.nisn || '-',
        `"${b.studentName}"`,
        `"${b.classGrade}"`,
        `"${b.title}"`,
        b.amount,
        b.paidAmount,
        b.amount - b.paidAmount,
        b.dueDate,
        b.status.toUpperCase(),
        `"${st?.parentName || '-'}"`,
        st?.parentPhone || '-'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\ufeff' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Laporan_Keuangan_CSV_${schoolInfo.shortName}_${selectedClass.replace(/\s+/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleIndividualBillDocx = (bill: Bill) => {
    const st = students.find(s => s.id === bill.studentId);
    if (!st) return;
    exportIndividualBillWord(bill, st, schoolInfo);
  };

  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Lunas
          </span>
        );
      case 'jatuh_tempo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <Clock className="w-3 h-3" /> Jatuh Tempo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3" /> Belum Lunas
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          {/* School Logo */}
          <div className="w-14 h-14 rounded-xl bg-white border border-slate-300 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
            {schoolInfo.logoUrl ? (
              <img src={schoolInfo.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center font-black text-center p-0.5">
                <span className="text-[9px] uppercase">SMK</span>
                <span className="text-xs leading-tight font-extrabold">{schoolInfo.shortName.slice(0, 5)}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-extrabold text-slate-900">
                Laporan &amp; Rekapitulasi Keuangan
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lembaga: <span className="font-semibold text-slate-800">{schoolInfo.name}</span> • NPSN: {schoolInfo.npsn}
            </p>
          </div>
        </div>

        {/* Action Buttons: Export PDF, Word, Excel, and School Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenSchoolSettings && (
            <button
              onClick={onOpenSchoolSettings}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 shadow-xs"
              title="Edit Nama, Alamat, dan Logo Sekolah"
            >
              <School className="w-4 h-4 text-emerald-600" />
              <span>Edit Identitas &amp; Logo</span>
            </button>
          )}

          {/* Export to Word Button */}
          <button
            onClick={handleExportWord}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Unduh format dokumen Word (.doc / .docx) dengan Kop Surat & Tanda Tangan"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor Word (.doc)</span>
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Unduh format spreadsheet Excel (.xls) dengan tabel bergaris dan formula"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel (.xls)</span>
          </button>

          {/* Print to PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Cetak dokumen formal atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>

          {/* More options dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
              title="Format Ekspor Lainnya"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Pilihan Format Tambahan:</div>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Unduh File CSV (.csv)</span>
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Format Word A4 (.doc)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Filter Data Siswa &amp; Tagihan:
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('Semua');
              setSelectedStatus('semua');
              setSelectedType('semua');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pencarian Siswa / Tagihan
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NISN, atau judul..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter Per Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
            >
              {classList.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Status Pembayaran
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">Lunas</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="jatuh_tempo">Jatuh Tempo (Prioritas)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kategori Tagihan
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
            >
              <option value="semua">Semua Kategori</option>
              <option value="spp">SPP Bulanan</option>
              <option value="uang_pengembangan">Uang Pengembangan</option>
            </select>
          </div>

        </div>
      </div>

      {/* Aggregate summary cards for filtered result */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Nominal Tagihan Terfilter</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatRupiah(totalBillAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{filteredBills.length} Item Tagihan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Sudah Terbayar (Masuk)</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatRupiah(totalPaidAmount)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {totalBillAmount > 0 ? Math.round((totalPaidAmount / totalBillAmount) * 100) : 0}% Realisasi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Sisa Piutang / Tunggakan</div>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatRupiah(totalUnpaidAmount)}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
            {filteredBills.filter(b => b.status !== 'lunas').length} Tagihan Belum Lunas
          </div>
        </div>
      </div>

      {/* PRINT-ONLY FORMAL REPORT HEADER (Visible only when printing to PDF) */}
      <div className="print-only hidden p-6 border-b-2 border-slate-900 mb-4 bg-white">
        <div className="flex items-center justify-between gap-6 pb-4 border-b-4 border-double border-slate-900">
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {schoolInfo.logoUrl ? (
              <img src={schoolInfo.logoUrl} alt="Logo Sekolah" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg">
                SMK
              </div>
            )}
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-black uppercase text-slate-900 tracking-wide">{schoolInfo.name}</h1>
            <p className="text-xs font-semibold text-slate-700">NPSN: {schoolInfo.npsn} • Status Akreditasi: {schoolInfo.akreditasi}</p>
            <p className="text-xs text-slate-600 leading-tight">{schoolInfo.address}</p>
            <p className="text-[11px] text-slate-500">Telp: {schoolInfo.phone} • Email: {schoolInfo.email} • Web: {schoolInfo.website}</p>
          </div>
          <div className="w-20 shrink-0"></div>
        </div>

        <div className="text-center my-4">
          <h2 className="text-base font-black uppercase underline tracking-wider">
            LAPORAN REKAPITULASI PEMBAYARAN KEUANGAN SISWA
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Tahun Ajaran 2024/2025 • Filter Kelas: <strong>{selectedClass}</strong> • Status: <strong>{selectedStatus.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">Siswa &amp; NISN</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4">Jenis Tagihan</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Terbayar</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Jatuh Tempo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center no-print">Aksi &amp; Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada data tagihan yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, idx) => {
                  const student = students.find(s => s.id === bill.studentId);
                  const remaining = bill.amount - bill.paidAmount;
                  const isPaid = bill.status === 'lunas';
                  const relatedTrx = transactions.find(t => t.billId === bill.id);

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-medium text-center">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bill.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NISN: {student?.nisn || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 text-center">{bill.classGrade}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{bill.title}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatRupiah(bill.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {formatRupiah(bill.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">
                        {formatRupiah(remaining)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-center">
                        {formatDateIndo(bill.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(bill.status)}
                      </td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* If unpaid, show WhatsApp reminder & Pay Now button & Surat Tagihan Word */}
                          {!isPaid && student && (
                            <>
                              <button
                                onClick={() => handleIndividualBillDocx(bill)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                title="Unduh Surat Tagihan Formal (.doc Word) untuk Wali Murid"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setActiveWhatsAppReminder({ student, bill })}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                                title="Kirim Pengingat Tagihan ke WhatsApp Wali Murid"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setActivePaymentBill(bill)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                title="Bayar Kasir / Payment Gateway"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Bayar</span>
                              </button>
                            </>
                          )}

                          {/* If paid, show receipt view button */}
                          {isPaid && (
                            <button
                              onClick={() => {
                                if (relatedTrx) {
                                  setSelectedReceiptTransaction(relatedTrx);
                                } else {
                                  // Create virtual receipt view
                                  setSelectedReceiptTransaction({
                                    id: `trx-${bill.id}`,
                                    invoiceNumber: `INV-${bill.id}`,
                                    receiptNumber: `KWT-2024/${bill.classGrade.split(' ')[1]}/${bill.id.slice(-4)}`,
                                    billId: bill.id,
                                    billTitle: bill.title,
                                    billType: bill.type,
                                    studentId: bill.studentId,
                                    studentName: bill.studentName,
                                    studentNisn: student?.nisn || '',
                                    classGrade: bill.classGrade,
                                    amount: bill.amount,
                                    adminFee: 0,
                                    totalAmount: bill.amount,
                                    channel: 'tunai_sekolah',
                                    channelName: 'Loket Kasir Bendahara Sekolah',
                                    status: 'berhasil',
                                    paidAt: bill.lastPaymentDate || bill.createdAt,
                                    referenceNumber: `REF-${bill.id}`
                                  });
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border border-emerald-200"
                              title="Lihat / Cetak Kwitansi Resmi"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Kwitansi</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Summary Row */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-[11px]">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-center uppercase text-slate-700">
                  Total Terfilter ({filteredBills.length} Tagihan)
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {formatRupiah(totalBillAmount)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">
                  {formatRupiah(totalPaidAmount)}
                </td>
                <td className="py-3 px-4 text-right text-rose-600">
                  {formatRupiah(totalUnpaidAmount)}
                </td>
                <td colSpan={3} className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE BLOCK (Visible only when printing to PDF) */}
      <div className="print-only hidden pt-8 px-6 bg-white">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah {schoolInfo.shortName}</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-sm">{schoolInfo.headmaster}</p>
            <p className="text-slate-500">NIP/NBM. -</p>
          </div>
          <div>
            <p>Gunungkidul, {formatDateIndo(new Date().toISOString())}</p>
            <p className="font-semibold">Bendahara Keuangan Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-sm">{schoolInfo.treasurerName}</p>
            <p className="text-slate-500">NIP. {schoolInfo.treasurerNip}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
