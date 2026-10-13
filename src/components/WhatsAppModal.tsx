import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

export const WhatsAppModal: React.FC = () => {
  const { activeWhatsAppReminder, setActiveWhatsAppReminder, schoolInfo, triggerPushNotification } = useApp();
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!activeWhatsAppReminder) return null;

  const { student, bill } = activeWhatsAppReminder;
  const remaining = bill.amount - bill.paidAmount;

  // Clean phone to 62...
  let phone = student.parentPhone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  else if (!phone.startsWith('62')) phone = '62' + phone;

  const fullMessage = `*PEMBERITAHUAN RESMI TAGIHAN - ${schoolInfo.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${student.parentName}*,
(Wali dari ananda *${student.name}* - Kelas *${student.classGrade}*)

Dengan hormat,
Kami dari Bagian Administrasi & Keuangan ${schoolInfo.shortName} menginformasikan kewajiban administrasi sekolah yang perlu diselesaikan:

📌 *Jenis Tagihan:* ${bill.title}
💰 *Sisa Tagihan:* ${formatRupiah(remaining)}
📅 *Batas Jatuh Tempo:* ${formatDateIndo(bill.dueDate)}
${bill.status === 'jatuh_tempo' ? '⚠️ *Status:* Sudah Melewati Tanggal Jatuh Tempo\n' : ''}
Pembayaran dapat dilakukan melalui *Portal EduPay* dengan opsi pembayaran lengkap:
• QRIS Instan (Semua E-Wallet / Bank)
• Virtual Account (BRI, BCA, Mandiri, BNI, BSI)
• Kasir Loket Bendahara Sekolah

${customNote ? `Catatan Khusus: ${customNote}\n\n` : ''}Bagi Bapak/Ibu yang sudah melakukan pembayaran, mohon abaikan pesan pengingat ini.

_Terima kasih atas kerja sama dan perhatian Bapak/Ibu._
Salam hormat,
*Bagian Keuangan ${schoolInfo.name}*
📞 Hubungi Kami: ${schoolInfo.phone}`;

  const handleSendWA = () => {
    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    triggerPushNotification(
      'Pengingat WA Terkirim',
      `Pesan pengingat tagihan untuk wali murid ${student.name} berhasil diarahkan ke WhatsApp.`,
      'info',
      student.id
    );
    setActiveWhatsAppReminder(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <MessageSquare className="w-6 h-6 text-green-100" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-green-100 bg-green-900/50 px-2 py-0.5 rounded-full">
                Pengingat Otomatis WhatsApp
              </span>
              <h2 className="text-lg font-bold mt-1 text-white">Kirim Tagihan ke Wali Murid</h2>
              <p className="text-xs text-green-100">
                Penerima: <span className="font-semibold text-white">{student.parentName}</span> ({student.parentPhone})
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveWhatsAppReminder(null)}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Student Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Nama Siswa:</span>
              <div className="font-bold text-slate-800 text-sm">{student.name}</div>
              <div className="text-slate-500">Kelas: {student.classGrade} • NISN: {student.nisn}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Total Tagihan:</span>
              <div className="font-black text-rose-600 text-base">{formatRupiah(remaining)}</div>
              <div className="text-slate-500">Jatuh Tempo: {formatDateIndo(bill.dueDate)}</div>
            </div>
          </div>

          {bill.status === 'jatuh_tempo' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tagihan ini sudah melewati tanggal jatuh tempo ({formatDateIndo(bill.dueDate)}). Prioritaskan pengingat!</span>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tambahkan Catatan Khusus (Opsional):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Contoh: Mohon segera konfirmasi agar kartu ujian dapat dicetak"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Preview Pesan WhatsApp
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
            
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {fullMessage}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WA: +{phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveWhatsAppReminder(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSendWA}
              className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 active:scale-95 rounded-lg shadow-md shadow-green-600/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka WhatsApp Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
