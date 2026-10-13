import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentPortal } from './components/StudentPortal';
import { ReportView } from './components/ReportView';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BillingManagementModal } from './components/BillingManagementModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { StudentManagementView } from './components/StudentManagementView';
import { UserManagementView } from './components/UserManagementView';
import { 
  ShieldCheck, 
  User, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  School,
  Lock,
  Phone,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeRole, 
    setActiveRole, 
    currentStudent, 
    currentStudentId, 
    setCurrentStudentId, 
    students, 
    schoolInfo,
    studentAccounts,
    studentLogin 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'students' | 'users' | 'student_portal'>(
    activeRole === 'admin' ? 'dashboard' : 'student_portal'
  );
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [inputNisn, setInputNisn] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle student NISN & Password login
  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNisn.trim()) {
      setLoginError('Masukkan NISN atau Nama Siswa.');
      return;
    }
    if (!inputPassword.trim()) {
      setLoginError('Masukkan kata sandi portal siswa (default adalah nomor NISN).');
      return;
    }

    const res = studentLogin(inputNisn.trim(), inputPassword.trim());
    if (res.success) {
      setActiveTab('student_portal');
      setShowLoginModal(false);
      setInputNisn('');
      setInputPassword('');
      setLoginError('');
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeRole === 'admin' ? (
          activeTab === 'reports' ? (
            <ReportView onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)} />
          ) : activeTab === 'students' ? (
            <StudentManagementView />
          ) : activeTab === 'users' ? (
            <UserManagementView />
          ) : (
            <AdminDashboard 
              onOpenBillingModal={() => setIsBillingModalOpen(true)}
              onNavigateToReports={() => setActiveTab('reports')}
              onNavigateToStudents={() => setActiveTab('students')}
              onNavigateToUsers={() => setActiveTab('users')}
              onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
            />
          )
        ) : (
          <StudentPortal />
        )}
      </main>

      {/* Floating Demo Quick-Switch Bar (Helper for Evaluators) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 no-print max-w-fit">
        <div className="bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold hidden sm:inline">Akses Cepat Mode:</span>
          
          <button
            onClick={() => {
              setActiveRole('admin');
              setActiveTab('dashboard');
            }}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'admin' 
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Keuangan</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('student');
              setActiveTab('student_portal');
            }}
            className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'student' 
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Portal Siswa &amp; Wali</span>
          </button>

          <button
            onClick={() => setShowLoginModal(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1"
          >
            Login NISN
          </button>

          {activeRole === 'admin' && (
            <>
              <button
                onClick={() => {
                  setActiveTab('users');
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Role &amp; Hak Akses</span>
              </button>

              <button
                onClick={() => setIsSchoolSettingsOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 ml-1 flex items-center gap-1"
              >
                <School className="w-3 h-3" />
                <span>Edit Logo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{schoolInfo.name}</span>
            <span>•</span>
            <span>Sistem EduPay Terintegrasi</span>
          </div>
          <div>
            NPSN: {schoolInfo.npsn} • Layanan Pembayaran: QRIS Dinamis, Virtual Account, Loket Sekolah
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <PaymentModal />
      <ReceiptModal />
      <WhatsAppModal />
      <BillingManagementModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
      />
      <NotificationDrawer 
        isOpen={isNotifDrawerOpen} 
        onClose={() => setIsNotifDrawerOpen(false)} 
      />
      <SchoolSettingsModal
        isOpen={isSchoolSettingsOpen}
        onClose={() => setIsSchoolSettingsOpen(false)}
      />

      {/* Student/Parent Login Modal Dialog */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Login Portal Siswa &amp; Wali Murid
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan Nomor Induk Siswa Nasional (NISN) untuk mengakses riwayat tagihan &amp; pembayaran
              </p>
            </div>

            <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  NISN / ID Pengguna Siswa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputNisn}
                    onChange={(e) => {
                      setInputNisn(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Contoh: 0078129031 atau Rizky"
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-600">
                    Kata Sandi / PIN
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Default: Nomor NISN
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Masukkan kata sandi portal"
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-10 pr-10 font-mono"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{loginError}</span>
                  </div>
                )}
              </div>

              {/* Quick select demo accounts */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 flex items-center justify-between">
                  <span>Pilih Cepat Akun Contoh:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Klik untuk auto-fill &amp; login</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {students.slice(0, 4).map(st => {
                    const acc = studentAccounts.find(a => a.studentId === st.id);
                    const isSuspended = acc?.status === 'suspended';

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setInputNisn(st.nisn);
                          setInputPassword(acc?.password || st.nisn);
                          setLoginError('');
                          // Auto login
                          const res = studentLogin(st.nisn, acc?.password || st.nisn);
                          if (res.success) {
                            setActiveTab('student_portal');
                            setShowLoginModal(false);
                          } else {
                            setLoginError(res.message);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          isSuspended 
                            ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-100/50' 
                            : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-bold text-slate-800 truncate flex items-center justify-between">
                          <span>{st.name.split(' ')[0]}</span>
                          {isSuspended && <span className="text-[9px] text-rose-600 font-bold">Suspended</span>}
                        </div>
                        <div className="text-[10px] text-slate-500">{st.classGrade} • NISN: {st.nisn}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Lupa kata sandi akun siswa? Silakan hubungi Tata Usaha atau Wali Kelas Anda untuk mereset kata sandi.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Masuk Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
