import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  ShieldCheck, 
  User, 
  RotateCcw, 
  ChevronDown,
  LayoutDashboard,
  FileSpreadsheet,
  Wallet,
  School,
  Users,
  UserCog
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  activeTab: 'dashboard' | 'reports' | 'students' | 'users' | 'student_portal';
  setActiveTab: (tab: 'dashboard' | 'reports' | 'students' | 'users' | 'student_portal') => void;
  onOpenNotifications: () => void;
  onOpenSchoolSettings?: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenNotifications,
  onOpenSchoolSettings 
}) => {
  const { 
    schoolInfo, 
    activeRole, 
    setActiveRole, 
    currentStudentId, 
    setCurrentStudentId, 
    students, 
    currentStudent, 
    unreadNotifCount, 
    resetAllData 
  } = useApp();

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              {schoolInfo.logoUrl ? (
                <img src={schoolInfo.logoUrl} alt={schoolInfo.name} className="w-full h-full object-contain p-1" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                  EduPay <span className="text-emerald-600">{schoolInfo.shortName}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  V.2.4
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Mode Mandiri (Tanpa API Key)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {schoolInfo.name}
              </p>
            </div>
          </div>

          {/* Navigation Links for Admin vs Student */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {activeRole === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dasbor Keuangan</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Laporan &amp; Filter Transaksi</span>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'students'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Data Siswa &amp; Kelas</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'users'
                      ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Manajemen Pengguna, Role & Hak Akses"
                >
                  <UserCog className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kelola Pengguna &amp; Role</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('student_portal')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-800 shadow-xs border border-slate-200/80"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Portal SPP &amp; Tagihan Siswa</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons: Role Switcher & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke Akun Bendahara Sekolah"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Keuangan</span>
                <span className="sm:hidden">Admin</span>
              </button>

              <button
                onClick={() => {
                  setActiveRole('student');
                  setActiveTab('student_portal');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'student'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke Portal Siswa & Wali Murid"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Siswa / Wali</span>
                <span className="sm:hidden">Siswa</span>
              </button>
            </div>

            {/* Quick Student Switcher (When in Student Mode) */}
            {activeRole === 'student' && (
              <div className="relative">
                <button
                  onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  <span className="truncate max-w-[90px] sm:max-w-[120px] font-semibold text-slate-800">
                    {currentStudent?.name.split(' ')[0]} ({currentStudent?.classGrade})
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {studentDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      Ganti Akun Siswa Demo
                    </div>
                    {students.map(st => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setCurrentStudentId(st.id);
                          setStudentDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-emerald-50 transition-colors ${
                          st.id === currentStudentId ? 'bg-emerald-50/70 text-emerald-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{st.name}</span>
                        <span className="text-[10px] text-slate-400">NISN: {st.nisn} • {st.classGrade}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit School Settings Button (Admin only) */}
            {activeRole === 'admin' && onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                title="Edit Identitas & Logo Sekolah"
              >
                <School className="w-5 h-5" />
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifikasi Tagihan & Saldo"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset data demo ke pengaturan awal SMK?')) {
                  resetAllData();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Reset Data Demo Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Mobile Tab Links */}
        <div className="flex md:hidden border-t border-slate-200 py-2 gap-2 text-xs font-semibold overflow-x-auto">
          {activeRole === 'admin' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Dasbor Keuangan
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Laporan &amp; Filter
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'students'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Data Siswa &amp; Kelas
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Kelola Pengguna
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('student_portal')}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-600 text-white font-bold"
            >
              Portal Tagihan Siswa
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
