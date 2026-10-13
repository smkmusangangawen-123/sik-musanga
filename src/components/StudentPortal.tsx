import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  ShieldCheck, 
  Building, 
  GraduationCap, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  BellRing,
  KeyRound,
  LogOut,
  Edit3,
  Phone,
  Shield,
  X,
  Lock,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndo, getDaysOverdue } from '../utils/formatters';
import { Bill } from '../types';

export const StudentPortal: React.FC = () => {
  const { 
    currentStudent, 
    bills, 
    transactions, 
    setActivePaymentBill, 
    setSelectedReceiptTransaction,
    currentStudentAccount,
    hasStudentPermission,
    studentLogout,
    changeCurrentStudentPassword,
    updateStudent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'spp' | 'pengembangan' | 'history'>('spp');

  // Change Password state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Edit Contact state
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState(currentStudent?.parentPhone || '');
  const [contactParentName, setContactParentName] = useState(currentStudent?.parentName || '');
  const [contactMsg, setContactMsg] = useState<string | null>(null);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Data siswa tidak ditemukan.
      </div>
    );
  }

  // Filter student bills
  const studentBills = bills.filter(b => b.studentId === currentStudent.id);
  const sppBills = studentBills.filter(b => b.type === 'spp');
  const pengembanganBills = studentBills.filter(b => b.type === 'uang_pengembangan');
  const studentTransactions = transactions.filter(t => t.studentId === currentStudent.id);

  // Permissions check
  const canPayOnline = hasStudentPermission('pay_online');
  const canDownloadReceipt = hasStudentPermission('download_receipt');
  const canViewHistory = hasStudentPermission('view_history');
  const canUpdateContact = hasStudentPermission('update_contact');

  // Compute summary numbers
  const unpaidSpp = sppBills.filter(b => b.status !== 'lunas');
  const totalUnpaidSppAmount = unpaidSpp.reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);

  const totalPengembangan = currentStudent.totalUangPengembangan;
  const paidPengembangan = currentStudent.paidUangPengembangan;
  const remainingPengembangan = totalPengembangan - paidPengembangan;
  const percentPengembangan = Math.round((paidPengembangan / totalPengembangan) * 100);

  // Next due bill
  const overdueBill = studentBills.find(b => b.status === 'jatuh_tempo');
  const currentMonthBill = studentBills.find(b => b.status !== 'lunas');

  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
          </span>
        );
      case 'jatuh_tempo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <Clock className="w-3.5 h-3.5" /> Jatuh Tempo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5" /> Belum Lunas
          </span>
        );
    }
  };

  // Submit Password Change
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Masukkan kata sandi lama Anda.' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Kata sandi baru minimal 4 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    const res = changeCurrentStudentPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMsg(null);
      }, 1500);
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  // Submit Contact Update
  const handleUpdateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) {
      alert('Nomor telepon tidak boleh kosong.');
      return;
    }
    updateStudent(currentStudent.id, {
      parentPhone: contactPhone.trim(),
      parentName: contactParentName.trim() || currentStudent.parentName
    });
    setContactMsg('Kontak berhasil diperbarui!');
    setTimeout(() => {
      setIsEditContactOpen(false);
      setContactMsg(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Student Identity Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 -mb-12 -mr-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner shrink-0">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200 bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  Portal Siswa &amp; Wali Murid
                </span>
                <span className="text-xs text-white/80 font-mono">
                  NISN: {currentStudent.nisn}
                </span>
                {currentStudentAccount?.status === 'active' ? (
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Akun Aktif
                  </span>
                ) : (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Akun Ditangguhkan
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
                {currentStudent.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Kelas: <span className="font-bold text-white">{currentStudent.classGrade}</span> • Jurusan: {currentStudent.major}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200/80 mt-1">
                <span>Wali Murid: <strong className="text-white">{currentStudent.parentName}</strong> ({currentStudent.parentPhone})</span>
                {canUpdateContact && (
                  <button
                    onClick={() => {
                      setContactPhone(currentStudent.parentPhone);
                      setContactParentName(currentStudent.parentName);
                      setIsEditContactOpen(true);
                    }}
                    className="text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 ml-1"
                  >
                    <Edit3 className="w-3 h-3" /> Ubah Kontak
                  </button>
                )}
              </div>

              {/* Student Account Action Buttons */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ganti Kata Sandi</span>
                </button>

                <button
                  onClick={studentLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-200 font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 border border-rose-400/30"
                  title="Keluar dari sesi portal siswa"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>

                {currentStudentAccount?.lastLogin && (
                  <span className="text-[10px] text-emerald-200/60 ml-2 hidden sm:inline">
                    Terakhir Login: {currentStudentAccount.lastLogin}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Pay CTA for Urgent / Current Due */}
          {(overdueBill || currentMonthBill) && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 sm:max-w-xs w-full">
              <div className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                Tagihan Perlu Dilunasi:
              </div>
              <div className="text-base font-bold text-white mt-0.5 truncate">
                {(overdueBill || currentMonthBill)?.title}
              </div>
              <div className="text-xl font-black text-amber-300 mt-1">
                {formatRupiah(((overdueBill || currentMonthBill)?.amount || 0) - ((overdueBill || currentMonthBill)?.paidAmount || 0))}
              </div>
              
              {canPayOnline ? (
                <button
                  onClick={() => setActivePaymentBill((overdueBill || currentMonthBill) as Bill)}
                  className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bayar Lewat Payment Gateway</span>
                </button>
              ) : (
                <div className="mt-3 p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg text-[10px] text-amber-200 text-center font-medium">
                  Pembayaran online dinonaktifkan oleh Admin. Mohon bayar langsung di Loket Sekolah.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* URGENT OVERDUE ALERT BANNER FOR STUDENT */}
      {studentBills.filter(b => b.status === 'jatuh_tempo').length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 rounded-2xl border-2 border-rose-400 p-5 shadow-md shadow-rose-500/10 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md ring-4 ring-rose-100 shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    Peringatan Keterlambatan Pembayaran
                  </span>
                  <span className="text-[11px] text-rose-600 font-bold">
                    Perhatian Segera!
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  Tagihan Anda Melewati Batas Jatuh Tempo
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  Terdapat kewajiban administrasi yang belum diselesaikan. Mohon segera melakukan pembayaran guna menghindari penangguhan pencetakan kartu ujian / kartu administrasi siswa.
                </p>

                {/* Overdue items pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {studentBills.filter(b => b.status === 'jatuh_tempo').map(b => {
                    const days = getDaysOverdue(b.dueDate);
                    const rem = b.amount - b.paidAmount;
                    return (
                      <div 
                        key={b.id} 
                        className="bg-white px-3 py-1.5 rounded-xl border border-rose-200 shadow-xs flex items-center gap-2 text-xs"
                      >
                        <span className="font-bold text-slate-800">{b.title}:</span>
                        <span className="font-black text-rose-600">{formatRupiah(rem)}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          {days > 0 ? `${days} Hari Terlambat` : 'Jatuh Tempo'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col justify-end gap-2">
              {canPayOnline ? (
                <button
                  onClick={() => {
                    const firstOverdue = studentBills.find(b => b.status === 'jatuh_tempo');
                    if (firstOverdue) setActivePaymentBill(firstOverdue);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pelunasan Sekarang (QRIS / VA)</span>
                </button>
              ) : (
                <div className="text-xs font-semibold text-rose-700 bg-rose-100 p-2 rounded-xl text-center">
                  Silakan lunasi di Loket TU
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('spp')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'spp'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tagihan SPP Bulanan ({sppBills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pengembangan')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pengembangan'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Uang Pengembangan / Sarpras</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Riwayat Kwitansi ({studentTransactions.length})</span>
        </button>
      </div>

      {/* Tab 1: SPP Bulanan */}
      {activeTab === 'spp' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Tagihan SPP Tahun Ajaran 2024/2025
              </h3>
              <p className="text-xs text-slate-500">
                Tarif SPP Bulanan: <strong>{formatRupiah(currentStudent.monthlySppAmount)}</strong> per bulan
              </p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[11px] text-emerald-800 font-bold block uppercase tracking-wider">
                Total Tunggakan SPP
              </span>
              <span className="text-lg font-black text-emerald-950">
                {formatRupiah(totalUnpaidSppAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sppBills.map(bill => {
              const isPaid = bill.status === 'lunas';
              const relatedTrx = transactions.find(t => t.billId === bill.id && t.status === 'berhasil');

              return (
                <div 
                  key={bill.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isPaid 
                      ? 'bg-slate-50 border-slate-200 opacity-90' 
                      : bill.status === 'jatuh_tempo'
                      ? 'bg-rose-50/40 border-rose-300 shadow-sm ring-1 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900">{bill.title}</span>
                    {getStatusBadge(bill.status)}
                  </div>

                  <div className="text-xl font-extrabold text-slate-800 mb-1">
                    {formatRupiah(bill.amount)}
                  </div>
                  <div className="text-xs text-slate-500 mb-4">
                    Jatuh Tempo: {formatDateIndo(bill.dueDate)}
                  </div>

                  {isPaid ? (
                    <button
                      onClick={() => {
                        if (canDownloadReceipt && relatedTrx) {
                          setSelectedReceiptTransaction(relatedTrx);
                        } else if (!canDownloadReceipt) {
                          alert('Izin cetak kuitansi mandiri dinonaktifkan oleh administrator sekolah.');
                        }
                      }}
                      className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{canDownloadReceipt ? 'Cetak Kwitansi' : 'Lunas (Kuitansi Dibatasi)'}</span>
                    </button>
                  ) : canPayOnline ? (
                    <button
                      onClick={() => setActivePaymentBill(bill)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar Online (QRIS/VA)</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-center p-2 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      Bayar di Loket Sekolah
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Uang Pengembangan & Sarpras */}
      {activeTab === 'pengembangan' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 p-6 shadow-xs space-y-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Ringkasan Kewajiban Uang Pengembangan Siswa Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dapat dilunasi secara bertahap dalam 3 termin angsuran selama tahun pelajaran berlangsung.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Progres Pelunasan:</span>
                <span className="text-emerald-700 font-bold">{percentPengembangan}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${percentPengembangan}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Sudah Dibayar: <strong className="text-slate-800">{formatRupiah(paidPengembangan)}</strong></span>
                <span>Sisa Kewajiban: <strong className="text-rose-600">{formatRupiah(remainingPengembangan)}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3">Rincian Angsuran Termin:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pengembanganBills.map(bill => {
                const isPaid = bill.status === 'lunas';
                const relatedTrx = transactions.find(t => t.billId === bill.id && t.status === 'berhasil');

                return (
                  <div key={bill.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-900">{bill.title}</span>
                      {getStatusBadge(bill.status)}
                    </div>

                    <div className="text-xl font-extrabold text-slate-800 mb-1">
                      {formatRupiah(bill.amount)}
                    </div>
                    <div className="text-xs text-slate-500 mb-4">
                      Batas Pelunasan: {formatDateIndo(bill.dueDate)}
                    </div>

                    {isPaid ? (
                      <button
                        onClick={() => relatedTrx && setSelectedReceiptTransaction(relatedTrx)}
                        className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Kwitansi Lunas</span>
                      </button>
                    ) : canPayOnline ? (
                      <button
                        onClick={() => setActivePaymentBill(bill)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Termin Ini</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-center p-2 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        Bayar di Loket Sekolah
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Riwayat Pembayaran & Kwitansi */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Riwayat Pembayaran Berhasil
              </h3>
              <p className="text-xs text-slate-500">
                Daftar seluruh transaksi yang telah berhasil divalidasi oleh sistem
              </p>
            </div>
          </div>

          {!canViewHistory ? (
            <div className="p-8 text-center text-amber-700 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold">
              Akses riwayat transaksi untuk akun ini dinonaktifkan oleh administrator sekolah.
            </div>
          ) : studentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada transaksi pembayaran tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentTransactions.map(trx => (
                <div key={trx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{trx.billTitle}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Kwitansi: <span className="font-mono font-semibold text-slate-700">{trx.receiptNumber}</span> • {formatDateIndo(trx.paidAt, true)}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{trx.channelName} (Ref: {trx.referenceNumber})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-500 font-medium">Total Dibayar</div>
                      <div className="text-base font-black text-emerald-700">
                        {formatRupiah(trx.amount)}
                      </div>
                    </div>

                    {canDownloadReceipt ? (
                      <button
                        onClick={() => setSelectedReceiptTransaction(trx)}
                        className="px-3 py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat / Cetak Kwitansi</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Cetak di Loket</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Ganti Kata Sandi Siswa */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Ubah Kata Sandi Akun Siswa</h3>
              </div>
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span className="font-bold block">{currentStudent.name}</span>
                <span className="text-[11px] text-slate-500">NISN / Username: {currentStudent.nisn}</span>
              </div>

              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ketik password lama (bawaan NISN)"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimal 4 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Update Kontak WhatsApp Wali Murid */}
      {isEditContactOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Perbarui Kontak WhatsApp Wali Murid</h3>
              </div>
              <button 
                onClick={() => setIsEditContactOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateContactSubmit} className="p-6 space-y-4 text-xs">
              {contactMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{contactMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Wali Murid:
                </label>
                <input
                  type="text"
                  value={contactParentName}
                  onChange={(e) => setContactParentName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Handphone / WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Nomor ini digunakan untuk pengiriman kuitansi dan pemberitahuan jatuh tempo otomatis.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditContactOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
