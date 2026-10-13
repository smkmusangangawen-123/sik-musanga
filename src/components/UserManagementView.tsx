import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  Edit3, 
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
  UserCheck,
  Shield,
  HelpCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppUser, UserRole, PermissionKey } from '../types';
import { ROLE_CONFIG, ALL_PERMISSIONS_LIST } from '../data/mockData';
import { StudentAccountManagement } from './StudentAccountManagement';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    setCurrentUserId, 
    addUser, 
    updateUser, 
    deleteUser, 
    resetUserPassword, 
    updateUserPermissions,
    studentAccounts
  } = useApp();

  // Management section tab (Staff vs Students)
  const [managementTab, setManagementTab] = useState<'staff' | 'students'>('staff');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionTargetUser, setPermissionTargetUser] = useState<AppUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  const [resetResult, setResetResult] = useState<{ user: AppUser; tempPass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    assignedClass: string;
    status: 'active' | 'suspended';
  }>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'staff_tu',
    assignedClass: '',
    status: 'active'
  });

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.assignedClass && user.assignedClass.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open modal to add user
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'bendahara',
      assignedClass: '',
      status: 'active'
    });
    setIsAddEditModalOpen(true);
  };

  // Open modal to edit user
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      assignedClass: user.assignedClass || '',
      status: user.status
    });
    setIsAddEditModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      alert('Mohon lengkapi username, nama lengkap, dan email.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        username: formData.username.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        assignedClass: formData.role === 'wali_kelas' ? formData.assignedClass : undefined,
        status: formData.status
      });
    } else {
      addUser({
        username: formData.username.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        assignedClass: formData.role === 'wali_kelas' ? formData.assignedClass : undefined,
        status: formData.status
      });
    }

    setIsAddEditModalOpen(false);
  };

  // Open Permissions Configuration Modal
  const handleOpenPermissionsModal = (user: AppUser) => {
    setPermissionTargetUser(user);
    const roleConf = ROLE_CONFIG[user.role];
    const initialPerms = user.customPermissions && user.customPermissions.length > 0
      ? user.customPermissions
      : (roleConf ? [...roleConf.defaultPermissions] : []);
    
    setSelectedPermissions(initialPerms);
    setIsPermissionsModalOpen(true);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter(k => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSavePermissions = () => {
    if (permissionTargetUser) {
      updateUserPermissions(permissionTargetUser.id, selectedPermissions);
      setIsPermissionsModalOpen(false);
      setPermissionTargetUser(null);
    }
  };

  const handleResetToRoleDefault = () => {
    if (permissionTargetUser) {
      const roleConf = ROLE_CONFIG[permissionTargetUser.role];
      if (roleConf) {
        setSelectedPermissions([...roleConf.defaultPermissions]);
      }
    }
  };

  // Reset Password Action
  const handleResetPassword = (user: AppUser) => {
    if (window.confirm(`Yakin ingin mereset kata sandi untuk @${user.username} (${user.fullName})? Sandi baru sementara akan dibuat.`)) {
      const res = resetUserPassword(user.id);
      setResetResult({ user, tempPass: res.tempPassword });
      setCopiedPass(false);
    }
  };

  const handleCopyTempPass = () => {
    if (resetResult?.tempPass) {
      navigator.clipboard.writeText(resetResult.tempPass);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 3000);
    }
  };

  // Handle Delete
  const handleDeleteUser = (user: AppUser) => {
    if (window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus akun @${user.username} (${user.fullName}) secara permanen?`)) {
      deleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Role-Based Access Control (RBAC) &amp; Manajemen Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Kelola Pengguna &amp; Hak Akses
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Atur akun pengelola keuangan sekolah, tentukan peran staf (Super Admin, Bendahara, Tata Usaha, Kepala Sekolah, Wali Kelas), reset kata sandi, serta sesuaikan hak akses tiap modul secara mendalam.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {managementTab === 'staff' ? (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/30 transition-all border border-indigo-400/30 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Akun Staf</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total {studentAccounts.length} Akun Siswa Terkelola</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Active Account Indicator */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs ring-2 ring-emerald-300">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <span>Sedang login sebagai: </span>
              <strong className="text-white font-semibold">{currentUser.fullName}</strong>
              <span className="text-slate-400"> (@{currentUser.username})</span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {ROLE_CONFIG[currentUser.role]?.label || currentUser.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Simulasi Akun Login:</span>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({ROLE_CONFIG[u.role]?.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs: Staff vs Student Accounts */}
      <div className="flex border-b border-slate-200 gap-2 mb-2 bg-slate-200/70 p-1.5 rounded-2xl max-w-fit">
        <button
          onClick={() => setManagementTab('staff')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
            managementTab === 'staff'
              ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Staf &amp; Pengelola Sekolah ({users.length})</span>
        </button>
        <button
          onClick={() => setManagementTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
            managementTab === 'students'
              ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Akun Login Siswa &amp; Wali Murid ({studentAccounts.length})</span>
        </button>
      </div>

      {managementTab === 'students' ? (
        <StudentAccountManagement />
      ) : (
        <>
          {/* Role Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => {
          const count = users.filter(u => u.role === roleKey).length;
          return (
            <div 
              key={roleKey}
              onClick={() => setRoleFilter(roleFilter === roleKey ? 'all' : roleKey)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                roleFilter === roleKey 
                  ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-2 ring-indigo-400/40' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${conf.badgeBg} ${conf.badgeColor}`}>
                  {conf.label}
                </span>
                <span className="text-base font-extrabold text-slate-800">{count}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-tight">
                {conf.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">Semua Peran ({users.length})</option>
              {Object.entries(ROLE_CONFIG).map(([k, c]) => (
                <option key={k} value={k}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="suspended">Nonaktif (Suspended)</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Role / Peran</th>
                <th className="py-3 px-4">Hak Akses Modul</th>
                <th className="py-3 px-4">Kontak &amp; Info</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada pengguna yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter peran.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role];
                  const effectivePerms = user.customPermissions && user.customPermissions.length > 0
                    ? user.customPermissions
                    : (roleConf ? roleConf.defaultPermissions : []);
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${isCurrent ? 'bg-indigo-50/30' : ''}`}>
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
                              {isCurrent && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                              <span>@{user.username}</span>
                              {user.assignedClass && (
                                <span className="text-amber-700 bg-amber-50 px-1 rounded border border-amber-200 text-[10px]">
                                  Binaan: {user.assignedClass}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleConf?.badgeBg} ${roleConf?.badgeColor}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{roleConf?.label || user.role}</span>
                        </span>
                      </td>

                      {/* Permissions overview & configure button */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPermissionsModal(user)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors"
                            title="Atur hak akses terperinci"
                          >
                            <KeyRound className="w-3 h-3 text-indigo-500" />
                            <span>{effectivePerms.length} Hak Akses</span>
                            {user.customPermissions && user.customPermissions.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Custom override" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Login: {user.lastLogin || 'Belum pernah'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                            title="Reset Kata Sandi Akun"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                            title="Edit Profil & Peran"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              isCurrent
                                ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 border-rose-200'
                            }`}
                            title={isCurrent ? 'Tidak bisa menghapus akun sendiri' : 'Hapus Akun'}
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
    </>
  )}

      {/* MODAL: Tambah / Edit Pengguna */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingUser ? 'Edit Data Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Sistem Manajemen Keuangan SPP &amp; Uang Gedung
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-4 text-xs">
              
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati, S.E."
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: siti.bendahara"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@smkmuh1ngawen.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran / Hak Akses Default <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => (
                    <option key={roleKey} value={roleKey}>
                      {conf.label} - {conf.description.substring(0, 50)}...
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {ROLE_CONFIG[formData.role]?.description}
                </p>
              </div>

              {/* If Wali Kelas, allow selecting class */}
              {formData.role === 'wali_kelas' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in duration-100">
                  <label className="block font-bold text-amber-900 text-xs">
                    Kelas Binaan Wali Kelas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: X TKJ 1, XI RPL 2, XII TBSM 1"
                    value={formData.assignedClass}
                    onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <p className="text-[10px] text-amber-700">
                    Wali Kelas hanya akan memantau notifikasi dan tunggakan siswa di kelas ini.
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Aktif (Bisa Login &amp; Mengakses Sistem)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="suspended"
                      checked={formData.status === 'suspended'}
                      onChange={() => setFormData({ ...formData, status: 'suspended' })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Nonaktifkan (Suspended)</span>
                  </label>
                </div>
              </div>

              {!editingUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kata Sandi Otomatis:</strong> Akun baru akan mendapatkan sandi sementara default <code>Musanga#2024!</code> yang dapat diganti atau direset kapan saja oleh admin.
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun Pengguna'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pengaturan Hak Akses (Granular Permissions) */}
      {isPermissionsModalOpen && permissionTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Konfigurasi Hak Akses: {permissionTargetUser.fullName}
                  </h3>
                  <p className="text-[11px] text-indigo-300">
                    Peran: <strong>{ROLE_CONFIG[permissionTargetUser.role]?.label}</strong> (@{permissionTargetUser.username})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Hak Akses Terpilih: </span>
                  <span className="text-indigo-600 font-extrabold">{selectedPermissions.length} dari {ALL_PERMISSIONS_LIST.length} modul</span>
                </div>
                <button
                  onClick={handleResetToRoleDefault}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline cursor-pointer"
                >
                  Kembalikan ke Default Role
                </button>
              </div>

              {/* Permission List */}
              <div className="space-y-2.5">
                {ALL_PERMISSIONS_LIST.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-50/60 border-indigo-200 shadow-xs' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${isChecked ? 'text-indigo-950' : 'text-slate-800'}`}>
                            {perm.label}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {perm.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {perm.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Helper notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Pengguna hanya dapat membuka menu dan menjalankan fungsi yang dicentang di atas. Super Admin selalu memiliki semua hak akses secara otomatis.
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold shadow-md shadow-indigo-700/20"
                >
                  Simpan Hak Akses
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hasil Reset Password Sukses */}
      {resetResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Kata Sandi Berhasil Direset!</h3>
              </div>
              <button 
                onClick={() => setResetResult(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Kata sandi untuk akun <strong>{resetResult.user.fullName}</strong> (<code>@{resetResult.user.username}</code>) telah direset ke sandi sementara berikut:
              </p>

              {/* Temp Password Box */}
              <div className="p-4 bg-slate-900 rounded-xl text-center space-y-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Kata Sandi Sementara (Temporary)
                </span>
                <div className="text-lg font-mono font-black text-emerald-400 tracking-wider">
                  {resetResult.tempPass}
                </div>
                <button
                  type="button"
                  onClick={handleCopyTempPass}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedPass ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Salin Sandi Sementara</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Silakan berikan kata sandi ini kepada pemilik akun. Pengguna disarankan untuk segera memperbarui kata sandi setelah login pertama kali.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setResetResult(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
