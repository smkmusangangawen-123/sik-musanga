import React from 'react';
import { X, Printer, Share2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo, terbilang } from '../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptTransaction, setSelectedReceiptTransaction, schoolInfo, students } = useApp();

  if (!selectedReceiptTransaction) return null;

  const trx = selectedReceiptTransaction;
  const student = students.find(s => s.id === trx.studentId);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!student) return;
    let phone = student.parentPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    else if (!phone.startsWith('62')) phone = '62' + phone;

    const message = `*BUKTI PEMBAYARAN RESMI - ${schoolInfo.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nomor Kwitansi: *${trx.receiptNumber}*
Tanggal: *${formatDateIndo(trx.paidAt, true)}*

Yth. Bapak/Ibu *${student.parentName}*,
Telah kami terima pembayaran atas:
Nama Siswa: *${trx.studentName}*
NISN: *${trx.studentNisn}*
Kelas: *${trx.classGrade}*

Rincian Pembayaran:
📌 Untuk Pembayaran: *${trx.billTitle}*
💳 Metode Pembayaran: *${trx.channelName}*
💰 Jumlah Dibayar: *${formatRupiah(trx.amount)}*
🏷️ Status: *LUNAS (SAH)*

_Dokumen ini merupakan bukti pembayaran elektronik resmi yang sah dari Bagian Keuangan ${schoolInfo.name}._
Terima kasih.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-800 text-white p-3.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Kwitansi Pembayaran Elektronik Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              title="Kirim ke WhatsApp Wali Murid"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim ke WA Wali</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={() => setSelectedReceiptTransaction(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans printable-receipt">
          
          {/* Header Kop Surat Sekolah */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* School Emblem / Badge */}
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
                {schoolInfo.logoUrl ? (
                  <img src={schoolInfo.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center font-black text-center p-0.5">
                    <span className="text-[10px] uppercase">SMK</span>
                    <span className="text-sm leading-tight font-extrabold">{schoolInfo.shortName.slice(0, 6)}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-700 font-medium">
                  NPSN: {schoolInfo.npsn} • Akreditasi: {schoolInfo.akreditasi}
                </p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {schoolInfo.address}
                </p>
                <p className="text-[11px] text-slate-500">
                  Telp: {schoolInfo.phone} • Email: {schoolInfo.email}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs uppercase rounded tracking-wider">
                KWITANSI LUNAS
              </div>
              <div className="text-[11px] font-mono text-slate-600 mt-1">
                {trx.receiptNumber}
              </div>
              <div className="text-[11px] text-slate-500">
                {formatDateIndo(trx.paidAt)}
              </div>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Telah Diterima Dari</span>
              <span className="col-span-2 sm:col-span-3 font-bold text-slate-900 uppercase">
                {trx.studentName} {student ? `(Wali: ${student.parentName})` : ''}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">NISN / Kelas</span>
              <span className="col-span-2 sm:col-span-3 font-semibold text-slate-800">
                {trx.studentNisn || '-'} / {trx.classGrade}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Untuk Pembayaran</span>
              <span className="col-span-2 sm:col-span-3 font-bold text-emerald-800">
                {trx.billTitle}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Kanal / Metode</span>
              <span className="col-span-2 sm:col-span-3 font-medium text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {trx.channelName} (Ref: {trx.referenceNumber})
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Uang Sejumlah (Terbilang)
              </div>
              <div className="font-serif italic font-bold text-slate-900 text-xs sm:text-sm bg-white p-2 rounded border border-slate-200">
                &ldquo;{terbilang(trx.amount)}&rdquo;
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="pt-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Nominal Pokok</span>
                <span className="font-semibold text-slate-800">{formatRupiah(trx.amount)}</span>
              </div>
              {trx.adminFee > 0 && (
                <div className="flex justify-between items-center py-1 text-slate-500 text-xs">
                  <span>Biaya Layanan Payment Gateway</span>
                  <span>{formatRupiah(trx.adminFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-t-2 border-slate-900 text-sm sm:text-base font-extrabold text-slate-900">
                <span>TOTAL DIBAYAR</span>
                <span className="text-emerald-700">{formatRupiah(trx.totalAmount)}</span>
              </div>
            </div>

            {/* Signature and Digital Stamp */}
            <div className="pt-6 grid grid-cols-2 gap-4 items-end">
              <div className="text-[11px] text-slate-500 space-y-1">
                <p><strong>Catatan:</strong></p>
                <p>• Kwitansi ini diterbitkan secara otomatis dan sah melalui Sistem Keuangan Digital {schoolInfo.shortName}.</p>
                <p>• Simpan tanda bukti ini sebagai arsip pelunasan administrasi sekolah.</p>
              </div>

              <div className="text-center relative">
                {/* Simulated Digital LUNAS Stamp */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 rotate-[-12deg]">
                  <div className="border-4 border-rose-600 border-dashed rounded-xl px-4 py-1.5 text-rose-600 font-black tracking-widest text-sm uppercase">
                    ★ LUNAS ★<br />
                    <span className="text-[9px] font-mono tracking-normal">{formatDateIndo(trx.paidAt)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  Gunungkidul, {formatDateIndo(trx.paidAt)}
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  Bendahara Sekolah,
                </div>
                
                {/* Digital Signature space */}
                <div className="h-14 flex items-center justify-center">
                  <span className="font-serif italic text-emerald-800 font-bold text-sm tracking-wider underline">
                    {schoolInfo.treasurerName}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {schoolInfo.treasurerName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  NIP. {schoolInfo.treasurerNip}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info (Hidden on print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 p-3.5 px-6 flex items-center justify-between text-xs text-slate-500">
          <span>ID Transaksi Sistem: {trx.id}</span>
          <button
            onClick={() => setSelectedReceiptTransaction(null)}
            className="text-slate-700 hover:text-slate-900 font-semibold"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
