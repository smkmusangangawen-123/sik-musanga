import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Check, 
  X, 
  Lock, 
  Unlock,
  Copy, 
  Search, 
  Filter, 
  ShieldCheck, 
  Printer, 
  Send, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink,
  GraduationCap,
  School,
  QrCode,
  Smartphone,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentAccount, StudentPermissionKey, Student } from '../types';
import { ALL_STUDENT_PERMISSIONS_LIST } from '../data/mockData';

export const StudentAccountManagement: React.FC = () => {
  const { 
    students, 
    studentAccounts, 
    addStudentAccount, 
    updateStudentAccount, 
    deleteStudentAccount, 
    resetStudentAccountPassword, 
    updateStudentAccountPermissions,
    schoolInfo
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Show/Hide password toggles per account
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [selectedStudentForNewAccount, setSelectedStudentForNewAccount] = useState<string>('');
  const [newAccountCustomPassword, setNewAccountCustomPassword] = useState('');
  const [newAccountPermissions, setNewAccountPermissions] = useState<StudentPermissionKey[]>([
    'pay_online', 'download_receipt', 'view_history', 'update_contact'
  ]);

  // Reset Password Modal
  const [resetModalAccount, setResetModalAccount] = useState<StudentAccount | null>(null);
  const [resetMethod, setResetMethod] = useState<'nisn' | 'random' | 'custom'>('nisn');
  const [customResetPassword, setCustomResetPassword] = useState('');
  const [resetSuccessData, setResetSuccessData] = useState<{
    account: StudentAccount;
    student: Student;
    newPass: string;
  } | null>(null);
  const [copiedInfo, setCopiedInfo] = useState(false);

  // Permissions Modal
  const [permModalAccount, setPermModalAccount] = useState<StudentAccount | null>(null);
  const [tempPermissions, setTempPermissions] = useState<StudentPermissionKey[]>([]);

  // Print Card Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetClass, setPrintTargetClass] = useState<string>('all');
  const [singlePrintAccount, setSinglePrintAccount] = useState<StudentAccount | null>(null);

  // Available classes list
  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).sort();

  // Students without account
  const studentsWithoutAccount = students.filter(
    s => !studentAccounts.some(acc => acc.studentId === s.id)
  );

  // Filtered student accounts
  const filteredAccounts = studentAccounts.filter(acc => {
    const student = students.find(s => s.id === acc.studentId);
    if (!student) return false;

    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.includes(searchTerm) ||
      student.nis.includes(searchTerm) ||
      student.classGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || student.classGrade === classFilter;
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const togglePasswordVisibility = (accId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [accId]: !prev[accId]
    }));
  };

  // Generate missing accounts in bulk
  const handleGenerateAllMissingAccounts = () => {
    if (studentsWithoutAccount.length === 0) return;
    if (window.confirm(`Buat akun login otomatis untuk ${studentsWithoutAccount.length} siswa yang belum memiliki akun? Password awal akan diatur sesuai NISN masing-masing.`)) {
      studentsWithoutAccount.forEach(st => {
        addStudentAccount(st.id, st.nisn);
      });
    }
  };

  // Submit Add Account
  const handleSubmitAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNewAccount) {
      alert('Pilih siswa terlebih dahulu.');
      return;
    }
    const created = addStudentAccount(selectedStudentForNewAccount, newAccountCustomPassword.trim() || undefined);
    if (created && newAccountPermissions.length > 0) {
      updateStudentAccountPermissions(created.id, newAccountPermissions);
    }
    setIsAddAccountModalOpen(false);
    setSelectedStudentForNewAccount('');
    setNewAccountCustomPassword('');
  };

  // Execute Password Reset
  const handleExecuteResetPassword = () => {
    if (!resetModalAccount) return;
    const student = students.find(s => s.id === resetModalAccount.studentId);
    if (!student) return;

    let targetPassword = '';
    if (resetMethod === 'nisn') {
      targetPassword = student.nisn;
    } else if (resetMethod === 'random') {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      targetPassword = `MSNG-${randNum}`;
    } else {
      if (!customResetPassword.trim()) {
        alert('Masukkan kata sandi baru.');
        return;
      }
      targetPassword = customResetPassword.trim();
    }

    const res = resetStudentAccountPassword(resetModalAccount.id, targetPassword);
    setResetSuccessData({
      account: resetModalAccount,
      student,
      newPass: res.tempPassword
    });
    setResetModalAccount(null);
    setCustomResetPassword('');
  };

  // WhatsApp message generator
  const getWhatsAppCredentialsMessage = (student: Student, pass: string) => {
    const text = `Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu ${student.parentName} (Wali dari ${student.name} - ${student.classGrade})

Berikut adalah informasi akun login Portal Pembayaran SPP & Keuangan (EduPay) SMK Muhammadiyah 1 Ngawen:

🆔 *ID Pengguna (NISN):* ${student.nisn}
🔑 *Kata Sandi:* ${pass}
🌐 *Tautan Portal:* https://${schoolInfo.website || 'smkmuh1ngawen.sch.id'}

Melalui portal ini, Bapak/Ibu dapat memantau rincian tagihan, melunasi SPP melalui QRIS/Virtual Account, serta mengunduh kuitansi resmi berstempel digital.

Simpan pesan ini dengan baik. Terima kasih.
_Wassalamu'alaikum Wr. Wb._
*Tata Usaha & Bendahara SMK Muhammadiyah 1 Ngawen*`;
    return encodeURIComponent(text);
  };

  // Copy Login credentials to clipboard
  const handleCopyCredentials = (student: Student, pass: string) => {
    const text = `INFORMASI AKUN LOGIN SISWA EDUPAY
Sekolah: ${schoolInfo.name}
Nama Siswa: ${student.name}
Kelas: ${student.classGrade}
NISN / Username: ${student.nisn}
Kata Sandi: ${pass}
Status: Aktif`;
    navigator.clipboard.writeText(text);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 3000);
  };

  // Toggle permission in modal
  const handleTogglePermInModal = (key: StudentPermissionKey) => {
    if (tempPermissions.includes(key)) {
      setTempPermissions(tempPermissions.filter(k => k !== key));
    } else {
      setTempPermissions([...tempPermissions, key]);
    }
  };

  const handleSavePermsModal = () => {
    if (permModalAccount) {
      updateStudentAccountPermissions(permModalAccount.id, tempPermissions);
      setPermModalAccount(null);
    }
  };

  // Print Card Accounts
  const accountsToPrint = singlePrintAccount 
    ? [singlePrintAccount] 
    : filteredAccounts.filter(acc => {
        if (printTargetClass === 'all') return true;
        const st = students.find(s => s.id === acc.studentId);
        return st?.classGrade === printTargetClass;
      });

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Total Akun Siswa</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{studentAccounts.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">dari {students.length} siswa sekolah</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Akun Siswa Aktif</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
              {studentAccounts.filter(a => a.status === 'active').length}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Dapat login ke portal</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Ditangguhkan</div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
              {studentAccounts.filter(a => a.status === 'suspended').length}
            </div>
            <div className="text-[10px] text-rose-500 mt-0.5">Akses dinonaktifkan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Belum Punya Akun</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
              {studentsWithoutAccount.length}
            </div>
            {studentsWithoutAccount.length > 0 ? (
              <button 
                onClick={handleGenerateAllMissingAccounts}
                className="text-[10px] text-amber-700 hover:underline font-bold mt-0.5"
              >
                + Buat Semua Otomatis
              </button>
            ) : (
              <div className="text-[10px] text-slate-400 mt-0.5">100% siswa berakun</div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NISN, NIS, kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Semua Kelas ({availableClasses.length})</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setSinglePrintAccount(null);
              setPrintTargetClass(classFilter !== 'all' ? classFilter : 'all');
              setIsPrintModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Cetak Kartu Login Siswa untuk dibagikan ke siswa/wali"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu Akun</span>
          </button>

          <button
            onClick={() => {
              setSelectedStudentForNewAccount(studentsWithoutAccount[0]?.id || '');
              setNewAccountCustomPassword('');
              setIsAddAccountModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Akun Siswa</span>
          </button>
        </div>
      </div>

      {/* Student Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Identitas Siswa</th>
                <th className="px-4 py-3.5">NISN (ID Login)</th>
                <th className="px-4 py-3.5">Kata Sandi</th>
                <th className="px-4 py-3.5">Hak Akses Siswa</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5">Terakhir Login</th>
                <th className="px-4 py-3.5 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Tidak ada akun siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const student = students.find(s => s.id === acc.studentId);
                  if (!student) return null;
                  const isPassVisible = visiblePasswords[acc.id];
                  const isDefaultPass = acc.password === student.nisn;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Student info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {student.classGrade}
                              </span>
                              <span>• NIS: {student.nis}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Wali: {student.parentName} ({student.parentPhone})
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NISN / Username */}
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">
                        {acc.nisn}
                      </td>

                      {/* Password */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {isPassVisible ? acc.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title={isPassVisible ? 'Sembunyikan' : 'Lihat Sandi'}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="text-[10px] mt-1 text-slate-400">
                          {isDefaultPass ? (
                            <span className="text-amber-600 font-semibold">Sandi Default (NISN)</span>
                          ) : (
                            <span className="text-indigo-600 font-semibold">Sandi Kustom</span>
                          )}
                        </div>
                      </td>

                      {/* Permissions badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {acc.permissions.includes('pay_online') && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <CreditCard className="w-2.5 h-2.5" /> Bayar Online
                            </span>
                          )}
                          {acc.permissions.includes('download_receipt') && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                              <FileText className="w-2.5 h-2.5" /> Kuitansi
                            </span>
                          )}
                          {acc.permissions.includes('view_history') && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
                              <Clock className="w-2.5 h-2.5" /> Riwayat
                            </span>
                          )}
                          {acc.permissions.includes('update_contact') && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded">
                              <Smartphone className="w-2.5 h-2.5" /> Kontak WA
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setPermModalAccount(acc);
                            setTempPermissions([...acc.permissions]);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline mt-1 block"
                        >
                          Atur Hak Akses ({acc.permissions.length}/4)
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {acc.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" /> Ditangguhkan
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {acc.lastLogin || <span className="text-slate-400 italic">Belum Pernah</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetModalAccount(acc);
                              setResetMethod('nisn');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 flex items-center gap-1 transition-colors"
                            title="Reset Kata Sandi Akun Siswa"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset</span>
                          </button>

                          {/* Print Card */}
                          <button
                            onClick={() => {
                              setSinglePrintAccount(acc);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Cetak Kartu Login Siswa ini"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Suspended */}
                          <button
                            onClick={() => {
                              const newStatus = acc.status === 'active' ? 'suspended' : 'active';
                              updateStudentAccount(acc.id, { status: newStatus });
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              acc.status === 'active'
                                ? 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                            }`}
                            title={acc.status === 'active' ? 'Tangguhkan Akun' : 'Aktifkan Akun'}
                          >
                            {acc.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus akun login siswa ${student.name} (NISN: ${acc.nisn})? Data siswa tetap ada namun login dinonaktifkan.`)) {
                                deleteStudentAccount(acc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus Akun Login"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Akun Siswa Baru */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Buat Akun Portal Siswa Baru</h3>
              </div>
              <button 
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Siswa:
                </label>
                <select
                  value={selectedStudentForNewAccount}
                  onChange={(e) => setSelectedStudentForNewAccount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                >
                  <option value="">-- Pilih Siswa Terdaftar --</option>
                  {students.map(st => {
                    const hasAcc = studentAccounts.some(a => a.studentId === st.id);
                    return (
                      <option key={st.id} value={st.id} disabled={hasAcc}>
                        {st.name} ({st.classGrade}) - NISN: {st.nisn} {hasAcc ? '✓ (Sudah Berakun)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Username login otomatis disesuaikan dengan NISN siswa terpilih.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Awal (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk otomatis menggunakan NISN siswa"
                  value={newAccountCustomPassword}
                  onChange={(e) => setNewAccountCustomPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Secara default, password awal diatur sama dengan NISN siswa agar mudah diingat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hak Akses Fitur Siswa:
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {ALL_STUDENT_PERMISSIONS_LIST.map(perm => (
                    <label key={perm.key} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAccountPermissions.includes(perm.key)}
                        onChange={() => {
                          if (newAccountPermissions.includes(perm.key)) {
                            setNewAccountPermissions(newAccountPermissions.filter(k => k !== perm.key));
                          } else {
                            setNewAccountPermissions([...newAccountPermissions, perm.key]);
                          }
                        }}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{perm.label}</div>
                        <div className="text-[10px] text-slate-500">{perm.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Simpan &amp; Aktifkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password Siswa */}
      {resetModalAccount && (() => {
        const student = students.find(s => s.id === resetModalAccount.studentId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-200" />
                  <h3 className="font-bold text-sm">Reset Sandi Akun Siswa</h3>
                </div>
                <button 
                  onClick={() => setResetModalAccount(null)}
                  className="text-amber-200 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <div className="font-bold">{student?.name}</div>
                  <div className="text-[11px] text-amber-700">
                    Kelas {student?.classGrade} • NISN: {student?.nisn}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Metode Reset Kata Sandi:
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      resetMethod === 'nisn' ? 'bg-emerald-50/70 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resetMethod"
                        checked={resetMethod === 'nisn'}
                        onChange={() => setResetMethod('nisn')}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div>
                        <div className="font-bold text-slate-800">Kembalikan ke Nomor NISN (Rekomendasi)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Sandi disetel kembali menjadi <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{student?.nisn}</code>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      resetMethod === 'random' ? 'bg-emerald-50/70 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resetMethod"
                        checked={resetMethod === 'random'}
                        onChange={() => setResetMethod('random')}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div>
                        <div className="font-bold text-slate-800">Generate Sandi Acak Otomatis</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Menghasilkan kata sandi aman sementara berformat <code>MSNG-xxxx</code>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      resetMethod === 'custom' ? 'bg-emerald-50/70 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resetMethod"
                        checked={resetMethod === 'custom'}
                        onChange={() => setResetMethod('custom')}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div className="w-full">
                        <div className="font-bold text-slate-800">Ketik Kata Sandi Kustom</div>
                        {resetMethod === 'custom' && (
                          <input
                            type="text"
                            placeholder="Ketik password baru..."
                            value={customResetPassword}
                            onChange={(e) => setCustomResetPassword(e.target.value)}
                            className="mt-2 w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResetModalAccount(null)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteResetPassword}
                    className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                  >
                    Reset Password Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Hasil Reset Password Sukses */}
      {resetSuccessData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Kata Sandi Siswa Berhasil Direset!</h3>
              </div>
              <button 
                onClick={() => setResetSuccessData(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Akun login portal untuk siswa <strong>{resetSuccessData.student.name}</strong> ({resetSuccessData.student.classGrade}) telah diperbarui:
              </p>

              {/* Password Display Box */}
              <div className="p-4 bg-slate-900 rounded-xl text-center space-y-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Kata Sandi Baru
                </span>
                <div className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                  {resetSuccessData.newPass}
                </div>
                <div className="text-[10px] text-slate-400">
                  ID Pengguna / Username: <span className="text-white font-mono font-bold">{resetSuccessData.student.nisn}</span>
                </div>
              </div>

              {/* Direct Sharing Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(resetSuccessData.student, resetSuccessData.newPass)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {copiedInfo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copiedInfo ? 'Informasi Login Tersalin!' : 'Salin Info Akun ke Clipboard'}</span>
                </button>

                <a
                  href={`https://wa.me/${resetSuccessData.student.parentPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${getWhatsAppCredentialsMessage(resetSuccessData.student, resetSuccessData.newPass)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim via WhatsApp ke Wali ({resetSuccessData.student.parentPhone})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSinglePrintAccount(resetSuccessData.account);
                    setResetSuccessData(null);
                    setIsPrintModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-2 transition-all border border-indigo-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Kartu Login Siswa Resmi</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setResetSuccessData(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Tutup Jendela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Atur Hak Akses Akun Siswa */}
      {permModalAccount && (() => {
        const student = students.find(s => s.id === permModalAccount.studentId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-sm">Pengaturan Hak Akses Portal Siswa</h3>
                    <div className="text-[10px] text-slate-400">{student?.name} ({student?.classGrade})</div>
                  </div>
                </div>
                <button 
                  onClick={() => setPermModalAccount(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Pilih modul yang diizinkan untuk siswa:</span>
                  <button
                    type="button"
                    onClick={() => setTempPermissions(['pay_online', 'download_receipt', 'view_history', 'update_contact'])}
                    className="text-[11px] text-emerald-600 hover:underline font-bold"
                  >
                    Pilih Semua Izin
                  </button>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {ALL_STUDENT_PERMISSIONS_LIST.map(perm => {
                    const isChecked = tempPermissions.includes(perm.key);
                    return (
                      <label 
                        key={perm.key} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked ? 'bg-white border-emerald-400 shadow-xs' : 'bg-slate-100/50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermInModal(perm.key)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className={`font-bold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                            {perm.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {perm.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    Jika opsi <strong>Bayar Mandiri Online</strong> tidak dicentang, siswa hanya dapat melihat tagihan dan diarahkan membayar langsung di loket pembayaran sekolah.
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPermModalAccount(null)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermsModal}
                    className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Simpan Hak Akses
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Cetak Kartu Akun Login Siswa (Print Ready) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Cetak Kartu Akses Login Portal EduPay</h3>
                  <p className="text-[11px] text-slate-400">
                    {singlePrintAccount ? 'Cetak 1 Kartu Siswa' : `Mencetak ${accountsToPrint.length} Kartu Siswa`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Filter Bar (Non-print) */}
            {!singlePrintAccount && (
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between no-print text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Filter Cetak Per Kelas:</span>
                  <select
                    value={printTargetClass}
                    onChange={(e) => setPrintTargetClass(e.target.value)}
                    className="py-1 px-3 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">Semua Siswa Terdaftar ({studentAccounts.length})</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>Kelas {c}</option>
                    ))}
                  </select>
                </div>
                <div className="text-slate-500">
                  Total {accountsToPrint.length} kartu akan dicetak
                </div>
              </div>
            )}

            {/* Printable Cards Content Area */}
            <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-100/60 print:bg-white print:p-0 print:max-h-none print:overflow-visible">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
                {accountsToPrint.map(acc => {
                  const student = students.find(s => s.id === acc.studentId);
                  if (!student) return null;

                  return (
                    <div 
                      key={acc.id}
                      className="bg-white rounded-xl border-2 border-slate-300 p-4 shadow-sm relative overflow-hidden print:border-slate-800 print:shadow-none break-inside-avoid"
                    >
                      {/* Card Header */}
                      <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                            M1
                          </div>
                          <div>
                            <div className="font-black text-[11px] text-slate-900 uppercase tracking-tight leading-none">
                              {schoolInfo.name}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              NPSN: {schoolInfo.npsn} • Portal Pembayaran SPP EduPay
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          AKUN RESMI
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <QrCode className="w-8 h-8 text-slate-700" />
                          <span className="text-[7px] text-slate-500 font-bold mt-0.5">Scan Portal</span>
                        </div>

                        <div className="space-y-1 text-xs flex-1">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Nama Siswa:</span>
                            <span className="font-extrabold text-slate-900 text-sm leading-tight block">{student.name}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block">Kelas:</span>
                              <span className="font-bold text-emerald-800">{student.classGrade}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block">Jurusan:</span>
                              <span className="font-semibold text-slate-700 truncate block text-[10px]">{student.major}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[9px] font-bold uppercase text-slate-400">ID Pengguna (NISN)</div>
                          <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{acc.nisn}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase text-slate-400">Kata Sandi Awal</div>
                          <div className="font-mono font-extrabold text-emerald-700 text-xs mt-0.5">{acc.password}</div>
                        </div>
                      </div>

                      {/* Card Footer Tips */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
                        <span>Akses: {schoolInfo.website || 'smkmuh1ngawen.sch.id'}</span>
                        <span>Harap simpan dan jaga kerahasiaan sandi</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Bottom (Non-print) */}
            <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                Gunakan pengaturan cetak <em>Landscape</em> atau <em>2 kolom</em> untuk hasil terbaik.
              </span>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
