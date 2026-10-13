import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet, 
  Store, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentChannel } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

export const PaymentModal: React.FC = () => {
  const { activePaymentBill, setActivePaymentBill, payBill, setSelectedReceiptTransaction } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(899); // 14:59 countdown

  useEffect(() => {
    if (!activePaymentBill) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activePaymentBill]);

  if (!activePaymentBill) return null;

  const bill = activePaymentBill;
  const remainingAmount = bill.amount - bill.paidAmount;

  const getFee = (ch: PaymentChannel) => {
    switch (ch) {
      case 'qris': return 2000;
      case 'va_bca':
      case 'va_mandiri':
      case 'va_bri':
      case 'va_bni': return 3000;
      case 'va_bsi': return 2500;
      case 'gopay':
      case 'ovo':
      case 'dana':
      case 'shopeepay': return 2000;
      case 'alfamart':
      case 'indomaret': return 3500;
      case 'tunai_sekolah': return 0;
    }
  };

  const adminFee = getFee(selectedChannel);
  const totalPayable = remainingAmount + adminFee;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const transaction = payBill(bill.id, selectedChannel, remainingAmount);
      setIsProcessing(false);
      setActivePaymentBill(null);
      // Auto open official receipt
      setSelectedReceiptTransaction(transaction);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <CreditCard className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200 bg-emerald-900/50 px-2 py-0.5 rounded-full">
                  Payment Gateway Terpadu
                </span>
                <span className="flex items-center text-xs text-amber-200 font-medium gap-1 bg-amber-950/40 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> {timeFormatted}
                </span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white">Pembayaran {bill.title}</h2>
              <p className="text-xs text-emerald-100">
                Siswa: <span className="font-semibold text-white">{bill.studentName}</span> • Kelas {bill.classGrade}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActivePaymentBill(null)}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Bill summary card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-xs font-medium text-slate-500">Nominal Kewajiban</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatRupiah(remainingAmount)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Batas Jatuh Tempo: {formatDateIndo(bill.dueDate)}
              </div>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto border-slate-200">
              <div className="text-xs font-medium text-slate-500">Biaya Layanan Gateway</div>
              <div className="text-sm font-semibold text-emerald-600">
                {adminFee === 0 ? 'Gratis (Rp 0)' : formatRupiah(adminFee)}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                Total Tagihan: <span className="text-emerald-700 font-bold">{formatRupiah(totalPayable)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Pilih Metode Pembayaran
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('qris')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'qris'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  {selectedChannel === 'qris' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">QRIS Instan</div>
                  <div className="text-[10px] text-slate-500">Semua E-Wallet / Bank</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('va_bri')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'va_bri'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {selectedChannel === 'va_bri' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">BRI (BRIVA)</div>
                  <div className="text-[10px] text-slate-500">Virtual Account</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('va_bca')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'va_bca'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {selectedChannel === 'va_bca' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">BCA VA</div>
                  <div className="text-[10px] text-slate-500">Virtual Account</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('va_mandiri')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'va_mandiri'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  {selectedChannel === 'va_mandiri' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">Mandiri VA</div>
                  <div className="text-[10px] text-slate-500">Livin / ATM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('va_bsi')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'va_bsi'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  {selectedChannel === 'va_bsi' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">BSI Syariah</div>
                  <div className="text-[10px] text-slate-500">Virtual Account</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('gopay')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'gopay'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  {selectedChannel === 'gopay' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">GoPay / DANA</div>
                  <div className="text-[10px] text-slate-500">Direct App Debit</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('indomaret')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'indomaret'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Store className="w-5 h-5 text-rose-500" />
                  {selectedChannel === 'indomaret' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">Indomaret / Alfa</div>
                  <div className="text-[10px] text-slate-500">Bayar di Kasir Ritel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('tunai_sekolah')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedChannel === 'tunai_sekolah'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Banknote className="w-5 h-5 text-amber-600" />
                  {selectedChannel === 'tunai_sekolah' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">Loket Sekolah</div>
                  <div className="text-[10px] text-slate-500">Tunai Bendahara</div>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Channel Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            {selectedChannel === 'qris' && (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Scan Kode QRIS Nasional (Dapat digunakan di BCA, Mandiri, BRI, Gopay, OVO, ShopeePay)
                </div>

                {/* Simulated SVG QR Code */}
                <div className="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-sm inline-block">
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none">
                    {/* Outer frame */}
                    <rect width="100" height="100" rx="4" fill="white" />
                    {/* Top-left marker */}
                    <rect x="8" y="8" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="12" y="12" width="20" height="20" rx="2" fill="white" />
                    <rect x="16" y="16" width="12" height="12" rx="1" fill="#0f172a" />

                    {/* Top-right marker */}
                    <rect x="64" y="8" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="68" y="12" width="20" height="20" rx="2" fill="white" />
                    <rect x="72" y="16" width="12" height="12" rx="1" fill="#0f172a" />

                    {/* Bottom-left marker */}
                    <rect x="8" y="64" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="12" y="68" width="20" height="20" rx="2" fill="white" />
                    <rect x="16" y="72" width="12" height="12" rx="1" fill="#0f172a" />

                    {/* QR Matrix Dots */}
                    <rect x="42" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="44" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="14" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="24" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="44" y="40" width="14" height="14" rx="2" fill="#059669" />
                    <rect x="64" y="44" width="8" height="8" fill="#0f172a" />
                    <rect x="76" y="52" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="64" y="70" width="8" height="8" fill="#0f172a" />
                    <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
                    <text x="51" y="50" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                      QRIS
                    </text>
                  </svg>
                  <div className="text-[11px] font-bold text-slate-800 tracking-wider mt-1">
                    NMID: ID1020049281729
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Buka aplikasi mobile banking atau e-wallet, pilih menu <strong>Scan QRIS</strong>, dan arahkan kamera ke kode di atas.
                </div>
              </div>
            )}

            {selectedChannel.startsWith('va_') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Nomor Virtual Account</div>
                    <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                      {selectedChannel === 'va_bca' && '12890078129031'}
                      {selectedChannel === 'va_bri' && '782910078129031'}
                      {selectedChannel === 'va_mandiri' && '88720078129031'}
                      {selectedChannel === 'va_bni' && '98820078129031'}
                      {selectedChannel === 'va_bsi' && '70120078129031'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(
                      selectedChannel === 'va_bca' ? '12890078129031' :
                      selectedChannel === 'va_bri' ? '782910078129031' :
                      selectedChannel === 'va_mandiri' ? '88720078129031' :
                      selectedChannel === 'va_bni' ? '98820078129031' : '70120078129031',
                      'va'
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                  >
                    {copiedKey === 'va' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'va' ? 'Tersalin' : 'Salin Nomor'}
                  </button>
                </div>

                <div className="text-xs text-slate-600 bg-blue-50/60 border border-blue-200/60 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Petunjuk Pembayaran m-Banking:</strong> Masuk ke menu Transfer &gt; Virtual Account &gt; Masukkan nomor VA di atas &gt; Pastikan nama penerima tertulis <strong>SMK Musanga - {bill.studentName}</strong> &gt; Masukkan PIN transaksi.
                  </div>
                </div>
              </div>
            )}

            {(selectedChannel === 'gopay' || selectedChannel === 'indomaret') && (
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {selectedChannel === 'indomaret' ? 'Kode Bayar Kasir Ritel' : 'ID Transaksi E-Wallet'}
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                      {selectedChannel === 'indomaret' ? 'PAY-EDUPAY-99201' : 'GP-DEBIT-778219'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedChannel === 'indomaret' ? 'PAY-EDUPAY-99201' : 'GP-DEBIT-778219', 'code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                  >
                    {copiedKey === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'code' ? 'Tersalin' : 'Salin Kode'}
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  {selectedChannel === 'indomaret' 
                    ? 'Tunjukkan kode bayar di atas ke kasir Indomaret atau Alfamart terdekat, sebutkan pembayaran EduPay SMK.'
                    : 'Aplikasi GoPay / DANA akan meminta konfirmasi otorisasi pembayaran langsung.'}
                </div>
              </div>
            )}

            {selectedChannel === 'tunai_sekolah' && (
              <div className="text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">Pembayaran di Loket Bendahara Sekolah:</div>
                <p>Silakan mendatangi ruang Tata Usaha / Keuangan sekolah pada jam kerja (Senin - Jumat, 07.30 - 14.30 WIB). Bendahara akan mencetak kwitansi resmi stempel basah.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Instant Settlement Simulator */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enkripsi 256-bit aman &amp; settlement instan</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActivePaymentBill(null)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <span>Simulasi Bayar &amp; Pelunasan Instan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
