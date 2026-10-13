import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Student, 
  Bill, 
  Transaction, 
  SchoolInfo, 
  NotificationItem, 
  PaymentChannel 
} from '../types';
import { 
  defaultSchoolInfo, 
  defaultStudents, 
  defaultBills, 
  defaultTransactions, 
  defaultNotifications,
  defaultUsers,
  defaultStudentAccounts,
  ROLE_CONFIG,
  ALL_STUDENT_PERMISSIONS_LIST
} from '../data/mockData';
import { 
  AppUser, 
  UserRole, 
  PermissionKey,
  StudentAccount,
  StudentPermissionKey
} from '../types';
import { createWhatsAppReminderUrl, formatRupiah, getDaysOverdue, formatDateIndo } from '../utils/formatters';

interface AppContextType {
  activeRole: 'admin' | 'student';
  setActiveRole: (role: 'admin' | 'student') => void;
  currentStudentId: string;
  setCurrentStudentId: (id: string) => void;
  currentStudent: Student | undefined;
  students: Student[];
  bills: Bill[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  schoolInfo: SchoolInfo;
  unreadNotifCount: number;
  
  // User & RBAC Management (Admin/Staff)
  users: AppUser[];
  currentUser: AppUser;
  setCurrentUserId: (id: string) => void;
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt' | 'lastLogin'>) => AppUser;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => boolean;
  resetUserPassword: (id: string) => { tempPassword: string; message: string };
  updateUserPermissions: (id: string, permissions: PermissionKey[]) => void;
  hasPermission: (permission: PermissionKey) => boolean;

  // Student Account & Role Management
  studentAccounts: StudentAccount[];
  currentStudentAccount: StudentAccount | undefined;
  addStudentAccount: (studentId: string, customPassword?: string) => StudentAccount;
  updateStudentAccount: (id: string, updates: Partial<StudentAccount>) => void;
  deleteStudentAccount: (id: string) => boolean;
  resetStudentAccountPassword: (id: string, customPass?: string) => { tempPassword: string; message: string };
  updateStudentAccountPermissions: (id: string, permissions: StudentPermissionKey[]) => void;
  hasStudentPermission: (permission: StudentPermissionKey) => boolean;
  studentLogin: (nisnOrNis: string, password: string) => { success: boolean; message: string; student?: Student };
  studentLogout: () => void;
  changeCurrentStudentPassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  
  // Actions
  payBill: (billId: string, channel: PaymentChannel, amount?: number, notes?: string) => Transaction;
  createBill: (billData: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => void;
  generateMonthlyBillsForClass: (targetMonth: string, dueDate: string, classGrade: string, amount: number) => number;
  sendWhatsAppReminder: (studentId: string, billId: string) => { url: string; message: string; phone: string };
  triggerPushNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'urgent', studentId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetAllData: () => void;
  selectedReceiptTransaction: Transaction | null;
  setSelectedReceiptTransaction: (tx: Transaction | null) => void;
  activePaymentBill: Bill | null;
  setActivePaymentBill: (bill: Bill | null) => void;
  activeWhatsAppReminder: { student: Student; bill: Bill } | null;
  setActiveWhatsAppReminder: (item: { student: Student; bill: Bill } | null) => void;
  updateSchoolInfo: (newInfo: SchoolInfo) => void;
  addStudent: (studentData: Omit<Student, 'id'>, autoCreateBills?: boolean) => Student;
  addBatchStudents: (studentsList: Array<Omit<Student, 'id'>>, autoCreateBills?: boolean) => number;
  updateStudent: (id: string, studentData: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  checkAndTriggerOverdueAlerts: (manualNotify?: boolean) => { overdueCount: number; overdueTotal: number };
  blastOverdueWarnings: () => { notifiedCount: number; totalOverdue: number };
  lastOverdueCheck: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio synthesizer for crisp payment success chime
function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Play pleasant high chime chord (E5, G#5, B5)
    [659.25, 830.61, 987.77].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state
  const [activeRole, setActiveRole] = useState<'admin' | 'student'>(() => {
    return (localStorage.getItem('edupay_role') as 'admin' | 'student') || 'admin';
  });
  
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    return localStorage.getItem('edupay_student_id') || 'std-001';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edupay_students');
    return saved ? JSON.parse(saved) : defaultStudents;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('edupay_bills');
    return saved ? JSON.parse(saved) : defaultBills;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('edupay_transactions');
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('edupay_notifications');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('edupay_school_info');
    return saved ? JSON.parse(saved) : defaultSchoolInfo;
  });

  const updateSchoolInfo = (newInfo: SchoolInfo) => {
    setSchoolInfo(newInfo);
    localStorage.setItem('edupay_school_info', JSON.stringify(newInfo));
    triggerPushNotification(
      'Identitas Sekolah Diperbarui',
      `Profil dan logo sekolah untuk ${newInfo.name} berhasil diperbarui.`,
      'success'
    );
  };

  // Modal states
  const [selectedReceiptTransaction, setSelectedReceiptTransaction] = useState<Transaction | null>(null);
  const [activePaymentBill, setActivePaymentBill] = useState<Bill | null>(null);
  const [activeWhatsAppReminder, setActiveWhatsAppReminder] = useState<{ student: Student; bill: Bill } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('edupay_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('edupay_student_id', currentStudentId);
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem('edupay_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edupay_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('edupay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('edupay_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Users & RBAC state
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('edupay_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('edupay_current_user_id') || 'usr-001';
  });

  useEffect(() => {
    localStorage.setItem('edupay_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('edupay_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || defaultUsers[0];

  // Permission checker for current active user
  const hasPermission = (permission: PermissionKey): boolean => {
    if (activeRole === 'student') return false;
    if (!currentUser) return true; // fallback
    if (currentUser.role === 'super_admin') return true;

    // Check custom permissions first if set
    if (currentUser.customPermissions && currentUser.customPermissions.length > 0) {
      return currentUser.customPermissions.includes(permission);
    }

    // Otherwise check role default permissions
    const roleConf = ROLE_CONFIG[currentUser.role];
    return roleConf ? roleConf.defaultPermissions.includes(permission) : false;
  };

  // Add new user
  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt' | 'lastLogin'>): AppUser => {
    const roleConf = ROLE_CONFIG[userData.role];
    const newUser: AppUser = {
      ...userData,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      customPermissions: userData.customPermissions || (roleConf ? [...roleConf.defaultPermissions] : [])
    };

    setUsers(prev => [newUser, ...prev]);

    triggerPushNotification(
      'Akun Pengguna Baru Ditambahkan',
      `Akun pengguna @${newUser.username} (${newUser.fullName}) berhasil dibuat dengan peran ${roleConf?.label || newUser.role}.`,
      'success'
    );

    return newUser;
  };

  // Update existing user
  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, ...updates };
      }
      return u;
    }));

    triggerPushNotification(
      'Data Pengguna Diperbarui',
      `Data akun dan hak akses pengguna berhasil disimpan.`,
      'info'
    );
  };

  // Delete user (prevent deleting own active account or the only super_admin)
  const deleteUser = (id: string): boolean => {
    const target = users.find(u => u.id === id);
    if (!target) return false;

    if (id === currentUserId) {
      alert('Tidak dapat menghapus akun yang sedang Anda gunakan saat ini.');
      return false;
    }

    const superAdminCount = users.filter(u => u.role === 'super_admin' && u.status === 'active').length;
    if (target.role === 'super_admin' && superAdminCount <= 1) {
      alert('Sistem harus memiliki setidaknya satu Super Admin aktif.');
      return false;
    }

    setUsers(prev => prev.filter(u => u.id !== id));

    triggerPushNotification(
      'Akun Pengguna Dihapus',
      `Akun @${target.username} (${target.fullName}) telah dihapus dari sistem oleh Admin.`,
      'warning'
    );
    return true;
  };

  // Reset user password / credentials
  const resetUserPassword = (id: string): { tempPassword: string; message: string } => {
    const target = users.find(u => u.id === id);
    // Generate secure human-readable temporary password e.g. "Musanga#2024!"
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `Musanga#${randomNum}!`;

    // Update status to active
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));

    triggerPushNotification(
      'Reset Sandi Akun Pengguna',
      `Password untuk @${target?.username || 'pengguna'} telah direset ke sandi sementara: ${tempPassword}`,
      'urgent'
    );

    return {
      tempPassword,
      message: `Password akun ${target?.fullName} (@${target?.username}) berhasil direset!`
    };
  };

  // Update granular permissions for a user
  const updateUserPermissions = (id: string, permissions: PermissionKey[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          customPermissions: permissions
        };
      }
      return u;
    }));

    triggerPushNotification(
      'Hak Akses Diperbarui',
      `Hak akses modul untuk pengguna ID ${id} berhasil disesuaikan.`,
      'info'
    );
  };

  // Student Accounts state with local storage persistence
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(() => {
    const saved = localStorage.getItem('edupay_student_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved student accounts', e);
      }
    }
    return defaultStudentAccounts;
  });

  useEffect(() => {
    localStorage.setItem('edupay_student_accounts', JSON.stringify(studentAccounts));
  }, [studentAccounts]);

  const currentStudentAccount = studentAccounts.find(a => a.studentId === currentStudentId);

  // Check student permission for currently active student
  const hasStudentPermission = (permission: StudentPermissionKey): boolean => {
    if (activeRole !== 'student') return true;
    const acc = studentAccounts.find(a => a.studentId === currentStudentId);
    if (!acc) return true; // default allowed
    if (acc.status === 'suspended') return false;
    return acc.permissions.includes(permission);
  };

  // Add student account
  const addStudentAccount = (studentId: string, customPassword?: string): StudentAccount => {
    const targetStudent = students.find(s => s.id === studentId);
    const existing = studentAccounts.find(a => a.studentId === studentId);
    if (existing) return existing;

    const newAcc: StudentAccount = {
      id: `acc-${studentId}`,
      studentId,
      nisn: targetStudent ? targetStudent.nisn : `NISN-${Date.now()}`,
      password: customPassword || (targetStudent ? targetStudent.nisn : '123456'),
      status: 'active',
      permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudentAccounts(prev => [newAcc, ...prev]);
    triggerPushNotification(
      'Akun Siswa Dibuat',
      `Akun login untuk ${targetStudent?.name || 'siswa'} (NISN: ${newAcc.nisn}) berhasil dibuat.`,
      'success'
    );
    return newAcc;
  };

  // Update student account
  const updateStudentAccount = (id: string, updates: Partial<StudentAccount>) => {
    setStudentAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    triggerPushNotification(
      'Akun Siswa Diperbarui',
      'Pengaturan akun login siswa berhasil disimpan.',
      'info'
    );
  };

  // Delete student account
  const deleteStudentAccount = (id: string): boolean => {
    const target = studentAccounts.find(a => a.id === id);
    if (!target) return false;
    setStudentAccounts(prev => prev.filter(a => a.id !== id));
    triggerPushNotification(
      'Akun Login Siswa Dihapus',
      `Akses login untuk NISN ${target.nisn} telah dihapus oleh Admin.`,
      'warning'
    );
    return true;
  };

  // Reset student account password
  const resetStudentAccountPassword = (id: string, customPass?: string): { tempPassword: string; message: string } => {
    const target = studentAccounts.find(a => a.id === id);
    const targetStudent = target ? students.find(s => s.id === target.studentId) : null;
    const tempPassword = customPass || (targetStudent ? targetStudent.nisn : `Musanga#${Math.floor(1000 + Math.random() * 9000)}`);

    setStudentAccounts(prev => prev.map(a => a.id === id ? { ...a, password: tempPassword, status: 'active' } : a));

    triggerPushNotification(
      'Reset Sandi Siswa',
      `Password akun login ${targetStudent?.name || target?.nisn} berhasil direset menjadi: ${tempPassword}`,
      'urgent',
      target?.studentId
    );

    return {
      tempPassword,
      message: `Password siswa ${targetStudent?.name || target?.nisn} berhasil direset ke "${tempPassword}"!`
    };
  };

  // Update permissions for student
  const updateStudentAccountPermissions = (id: string, permissions: StudentPermissionKey[]) => {
    setStudentAccounts(prev => prev.map(a => a.id === id ? { ...a, permissions } : a));
    triggerPushNotification(
      'Hak Akses Siswa Diperbarui',
      'Pengaturan izin portal siswa berhasil disimpan.',
      'info'
    );
  };

  // Student Login handler with NISN & Password validation
  const studentLogin = (nisnOrNis: string, password: string): { success: boolean; message: string; student?: Student } => {
    const cleanInput = nisnOrNis.trim().toLowerCase();
    const matched = students.find(s => 
      s.nisn.toLowerCase() === cleanInput || 
      s.nis.toLowerCase() === cleanInput ||
      s.name.toLowerCase() === cleanInput
    );

    if (!matched) {
      return { 
        success: false, 
        message: 'NISN atau Nama Siswa tidak ditemukan dalam basis data sekolah.' 
      };
    }

    let acc = studentAccounts.find(a => a.studentId === matched.id || a.nisn === matched.nisn);
    if (!acc) {
      acc = {
        id: `acc-${matched.id}`,
        studentId: matched.id,
        nisn: matched.nisn,
        password: matched.nisn,
        status: 'active',
        permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStudentAccounts(prev => [acc!, ...prev]);
    }

    if (acc.status === 'suspended') {
      return {
        success: false,
        message: 'Akun portal siswa ini dinonaktifkan / ditangguhkan oleh Administrator Sekolah. Silakan hubungi loket TU / Bendahara.'
      };
    }

    if (acc.password !== password.trim()) {
      return {
        success: false,
        message: 'Kata sandi / PIN yang Anda masukkan salah. Password awal adalah nomor NISN siswa.'
      };
    }

    // Success login
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    setStudentAccounts(prev => prev.map(a => a.id === acc!.id ? { ...a, lastLogin: `${nowStr} WIB` } : a));
    setCurrentStudentId(matched.id);
    setActiveRole('student');

    triggerPushNotification(
      'Login Siswa Berhasil',
      `Selamat datang di portal pembayaran, ${matched.name}!`,
      'info',
      matched.id
    );

    return {
      success: true,
      message: 'Login berhasil!',
      student: matched
    };
  };

  const studentLogout = () => {
    setActiveRole('admin');
  };

  const changeCurrentStudentPassword = (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    const acc = studentAccounts.find(a => a.studentId === currentStudentId);
    if (!acc) return { success: false, message: 'Akun siswa tidak ditemukan.' };

    if (acc.password !== oldPassword.trim()) {
      return { success: false, message: 'Kata sandi saat ini tidak cocok.' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
    }

    setStudentAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, password: newPassword.trim() } : a));

    triggerPushNotification(
      'Sandi Berhasil Diubah',
      'Kata sandi portal siswa Anda telah diperbarui.',
      'success',
      currentStudentId
    );

    return {
      success: true,
      message: 'Kata sandi berhasil diubah!'
    };
  };

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  const unreadNotifCount = notifications.filter(n => {
    if (activeRole === 'student') {
      return !n.read && (!n.studentId || n.studentId === currentStudentId);
    }
    return !n.read;
  }).length;

  const triggerPushNotification = (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'urgent' = 'info', 
    studentId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      studentId,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Request native browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, icon: '/favicon.ico' });
      } catch {
        // Notification failed or blocked
      }
    }
  };

  const getChannelName = (channel: PaymentChannel): { name: string; fee: number } => {
    switch (channel) {
      case 'qris': return { name: 'QRIS Dinamis (Gopay/OVO/ShopeePay/DANA)', fee: 2000 };
      case 'va_bca': return { name: 'BCA Virtual Account', fee: 3000 };
      case 'va_mandiri': return { name: 'Mandiri Virtual Account', fee: 3000 };
      case 'va_bri': return { name: 'BRIVA (BRI Virtual Account)', fee: 3000 };
      case 'va_bni': return { name: 'BNI Virtual Account', fee: 3000 };
      case 'va_bsi': return { name: 'BSI Syariah Virtual Account', fee: 2500 };
      case 'gopay': return { name: 'GoPay Direct Debit', fee: 2000 };
      case 'ovo': return { name: 'OVO E-Wallet', fee: 2000 };
      case 'dana': return { name: 'DANA E-Wallet', fee: 2000 };
      case 'shopeepay': return { name: 'ShopeePay', fee: 2000 };
      case 'alfamart': return { name: 'Gerai Alfamart', fee: 3500 };
      case 'indomaret': return { name: 'Gerai Indomaret', fee: 3500 };
      case 'tunai_sekolah': return { name: 'Loket Kasir Bendahara Sekolah', fee: 0 };
    }
  };

  const payBill = (billId: string, channel: PaymentChannel, payAmount?: number, notes?: string): Transaction => {
    const targetBill = bills.find(b => b.id === billId);
    if (!targetBill) {
      throw new Error('Tagihan tidak ditemukan');
    }

    const student = students.find(s => s.id === targetBill.studentId);
    const amountToPay = payAmount || (targetBill.amount - targetBill.paidAmount);
    const { name: channelName, fee: adminFee } = getChannelName(channel);
    const now = new Date();
    const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateCode}-${randSeq}`;
    const receiptNumber = `KWT-${now.getFullYear()}/${targetBill.classGrade.split(' ')[1] || 'SMK'}/${String(now.getMonth() + 1).padStart(2, '0')}/${randSeq}`;
    const referenceNumber = `${channel.toUpperCase()}-${Date.now().toString().slice(-8)}`;

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber,
      receiptNumber,
      billId: targetBill.id,
      billTitle: targetBill.title,
      billType: targetBill.type,
      studentId: targetBill.studentId,
      studentName: targetBill.studentName,
      studentNisn: student?.nisn || '',
      classGrade: targetBill.classGrade,
      amount: amountToPay,
      adminFee,
      totalAmount: amountToPay + adminFee,
      channel,
      channelName,
      vaNumber: channel.startsWith('va_') ? `88${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
      status: 'berhasil',
      paidAt: now.toISOString(),
      referenceNumber,
      notes: notes || `Pembayaran ${targetBill.title} sukses melalui ${channelName}`
    };

    // Update bill
    const updatedPaidAmount = targetBill.paidAmount + amountToPay;
    const isFullyPaid = updatedPaidAmount >= targetBill.amount;
    
    setBills(prev => prev.map(b => {
      if (b.id === billId) {
        return {
          ...b,
          paidAmount: updatedPaidAmount,
          status: isFullyPaid ? 'lunas' : 'sebagian',
          lastPaymentDate: now.toISOString()
        };
      }
      return b;
    }));

    // If Uang Pengembangan, update student accumulated record
    if (targetBill.type === 'uang_pengembangan') {
      setStudents(prev => prev.map(s => {
        if (s.id === targetBill.studentId) {
          return {
            ...s,
            paidUangPengembangan: Math.min(s.totalUangPengembangan, s.paidUangPengembangan + amountToPay)
          };
        }
        return s;
      }));
    }

    // Add transaction to history
    setTransactions(prev => [newTransaction, ...prev]);

    // Push notification & sound
    triggerPushNotification(
      'Pembayaran Berhasil! 🟢',
      `Pembayaran ${targetBill.title} sebesar ${formatRupiah(amountToPay)} atas nama ${targetBill.studentName} telah berhasil diverifikasi oleh sistem.`,
      'success',
      targetBill.studentId
    );

    // Audio chime & Confetti
    playSuccessChime();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored if canvas blocked
    }

    return newTransaction;
  };

  const createBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => {
    const student = students.find(s => s.id === billData.studentId);
    if (!student) return;

    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      createdAt: new Date().toISOString(),
      paidAmount: 0,
      status: 'belum_lunas',
      studentName: student.name,
      classGrade: student.classGrade
    };

    setBills(prev => [newBill, ...prev]);
    triggerPushNotification(
      'Tagihan Baru Diterbitkan',
      `Tagihan baru: ${newBill.title} sebesar ${formatRupiah(newBill.amount)} telah diterbitkan untuk ${student.name}.`,
      'info',
      student.id
    );
  };

  const generateMonthlyBillsForClass = (
    targetMonth: string,
    dueDate: string,
    classGrade: string,
    amount: number
  ): number => {
    const targetStudents = classGrade === 'Semua' 
      ? students 
      : students.filter(s => s.classGrade === classGrade);

    let count = 0;
    const newBillsList: Bill[] = [];

    targetStudents.forEach(st => {
      // Check if bill already exists for this student and month
      const exists = bills.some(b => b.studentId === st.id && b.type === 'spp' && b.month === targetMonth);
      if (!exists) {
        newBillsList.push({
          id: `bill-${Date.now()}-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          classGrade: st.classGrade,
          title: `SPP ${targetMonth}`,
          type: 'spp',
          month: targetMonth,
          academicYear: '2024/2025',
          amount: amount || st.monthlySppAmount,
          paidAmount: 0,
          dueDate,
          status: 'belum_lunas',
          createdAt: new Date().toISOString()
        });
        count++;
      }
    });

    if (newBillsList.length > 0) {
      setBills(prev => [...newBillsList, ...prev]);
      triggerPushNotification(
        'Generate Tagihan Massal Selesai',
        `Berhasil menerbitkan ${count} tagihan SPP ${targetMonth} untuk kelas ${classGrade}.`,
        'success'
      );
    }

    return count;
  };

  const sendWhatsAppReminder = (studentId: string, billId: string) => {
    const student = students.find(s => s.id === studentId);
    const bill = bills.find(b => b.id === billId);
    if (!student || !bill) {
      throw new Error('Data siswa atau tagihan tidak ditemukan');
    }

    const { url, message, cleanPhone } = createWhatsAppReminderUrl({
      phone: student.parentPhone,
      studentName: student.name,
      parentName: student.parentName,
      classGrade: student.classGrade,
      billTitle: bill.title,
      amount: bill.amount - bill.paidAmount,
      dueDate: bill.dueDate,
      schoolName: schoolInfo.name
    });

    // Record notification
    triggerPushNotification(
      'Pengingat WhatsApp Terkirim 💬',
      `Pesan pengingat tagihan ${bill.title} telah dikirim ke nomor WA ${student.parentName} (${cleanPhone}).`,
      'info',
      student.id
    );

    return { url, message, phone: cleanPhone };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addStudent = (studentData: Omit<Student, 'id'>, autoCreateBills: boolean = true): Student => {
    const newStudentId = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newStudent: Student = {
      ...studentData,
      id: newStudentId
    };

    setStudents(prev => [newStudent, ...prev]);

    // Optionally generate initial bills
    if (autoCreateBills) {
      const now = new Date();
      const currentMonthYear = 'Oktober 2024';
      const initialBills: Bill[] = [
        {
          id: `bill-${Date.now()}-spp`,
          studentId: newStudentId,
          studentName: newStudent.name,
          classGrade: newStudent.classGrade,
          title: `SPP ${currentMonthYear}`,
          type: 'spp',
          month: currentMonthYear,
          academicYear: '2024/2025',
          amount: newStudent.monthlySppAmount,
          paidAmount: 0,
          dueDate: `${now.getFullYear()}-10-10`,
          status: 'belum_lunas',
          createdAt: now.toISOString()
        },
        {
          id: `bill-${Date.now()}-sarpras`,
          studentId: newStudentId,
          studentName: newStudent.name,
          classGrade: newStudent.classGrade,
          title: 'Uang Pengembangan - Tahap 1',
          type: 'uang_pengembangan',
          academicYear: '2024/2025',
          amount: Math.round(newStudent.totalUangPengembangan / 3),
          paidAmount: 0,
          dueDate: `${now.getFullYear()}-10-25`,
          status: 'belum_lunas',
          createdAt: now.toISOString()
        }
      ];
      setBills(prev => [...initialBills, ...prev]);
    }

    triggerPushNotification(
      'Siswa Baru Ditambahkan 🎓',
      `Data siswa ${newStudent.name} (${newStudent.classGrade} - ${newStudent.major}) berhasil didaftarkan ke sistem.`,
      'success',
      newStudentId
    );

    return newStudent;
  };

  const addBatchStudents = (studentsList: Array<Omit<Student, 'id'>>, autoCreateBills: boolean = true): number => {
    let createdCount = 0;
    const newStudents: Student[] = [];
    const newBillsList: Bill[] = [];
    const now = new Date();

    studentsList.forEach((stData, idx) => {
      const newId = `std-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
      const studentObj: Student = {
        ...stData,
        id: newId
      };
      newStudents.push(studentObj);
      createdCount++;

      if (autoCreateBills) {
        newBillsList.push({
          id: `bill-${Date.now()}-${idx}-spp`,
          studentId: newId,
          studentName: studentObj.name,
          classGrade: studentObj.classGrade,
          title: 'SPP Oktober 2024',
          type: 'spp',
          month: 'Oktober 2024',
          academicYear: '2024/2025',
          amount: studentObj.monthlySppAmount,
          paidAmount: 0,
          dueDate: '2024-10-10',
          status: 'belum_lunas',
          createdAt: now.toISOString()
        });
        newBillsList.push({
          id: `bill-${Date.now()}-${idx}-sarpras`,
          studentId: newId,
          studentName: studentObj.name,
          classGrade: studentObj.classGrade,
          title: 'Uang Pengembangan - Tahap 1',
          type: 'uang_pengembangan',
          academicYear: '2024/2025',
          amount: Math.round(studentObj.totalUangPengembangan / 3),
          paidAmount: 0,
          dueDate: '2024-10-25',
          status: 'belum_lunas',
          createdAt: now.toISOString()
        });
      }
    });

    if (newStudents.length > 0) {
      setStudents(prev => [...newStudents, ...prev]);
    }
    if (newBillsList.length > 0) {
      setBills(prev => [...newBillsList, ...prev]);
    }

    triggerPushNotification(
      'Import Siswa Berhasil 🎓',
      `Berhasil menambahkan ${createdCount} data siswa baru secara massal.`,
      'success'
    );

    return createdCount;
  };

  const updateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...studentData };
      }
      return s;
    }));

    // If student name or class was updated, update bills too
    if (studentData.name || studentData.classGrade) {
      setBills(prev => prev.map(b => {
        if (b.studentId === id) {
          return {
            ...b,
            studentName: studentData.name || b.studentName,
            classGrade: studentData.classGrade || b.classGrade
          };
        }
        return b;
      }));
    }

    triggerPushNotification(
      'Data Siswa Diperbarui',
      `Informasi profil siswa berhasil disimpan.`,
      'info',
      id
    );
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setBills(prev => prev.filter(b => b.studentId !== id));
    setStudentAccounts(prev => prev.filter(a => a.studentId !== id));

    triggerPushNotification(
      'Data Siswa Dihapus',
      `Data siswa ${student?.name || id} dan seluruh tagihan serta akun login telah dihapus dari sistem.`,
      'warning'
    );
  };

  const [lastOverdueCheck, setLastOverdueCheck] = useState<string>(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });

  const checkAndTriggerOverdueAlerts = (manualNotify: boolean = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let count = 0;
    let total = 0;
    const overdueItems: Bill[] = [];

    // Scan bills and flag overdue ones
    setBills(prev => prev.map(bill => {
      if (bill.status !== 'lunas') {
        const due = new Date(bill.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() < today.getTime()) {
          count++;
          total += (bill.amount - bill.paidAmount);
          overdueItems.push(bill);
          return { ...bill, status: 'jatuh_tempo' as const };
        }
      }
      return bill;
    }));

    const checkTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setLastOverdueCheck(checkTime);

    if (manualNotify && count > 0) {
      // Trigger student push notifications
      overdueItems.slice(0, 4).forEach(b => {
        const days = getDaysOverdue(b.dueDate);
        triggerPushNotification(
          `⚠️ Peringatan Keterlambatan: ${b.title}`,
          `Tagihan ${b.title} sebesar ${formatRupiah(b.amount - b.paidAmount)} telah melewati jatuh tempo (${days > 0 ? `${days} hari terlambat` : 'segera lunasi'}). Segera lunasi via portal EduPay.`,
          'urgent',
          b.studentId
        );
      });

      triggerPushNotification(
        'Hasil Pengecekan Keterlambatan Sistem 🔔',
        `Pengecekan otomatis selesai pada ${checkTime}: Ditemukan ${count} tagihan melewati batas tempo dengan total piutang ${formatRupiah(total)}.`,
        'warning'
      );
    }

    return { overdueCount: count, overdueTotal: total };
  };

  const blastOverdueWarnings = () => {
    const overdueList = bills.filter(b => b.status === 'jatuh_tempo');
    const totalAmount = overdueList.reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);

    overdueList.forEach(b => {
      const days = getDaysOverdue(b.dueDate);
      triggerPushNotification(
        `🚨 PERINGATAN KETERLAMBATAN SPP: ${b.title}`,
        `Tagihan ${b.title} atas nama ${b.studentName} (${formatRupiah(b.amount - b.paidAmount)}) terlambat ${days} hari dari jatuh tempo (${formatDateIndo(b.dueDate)}). Segera lakukan pelunasan.`,
        'urgent',
        b.studentId
      );
    });

    triggerPushNotification(
      'Notifikasi Peringatan Massal Terkirim 🚀',
      `Berhasil mengirim notifikasi peringatan darurat ke ${overdueList.length} siswa dan wali murid yang menunggak.`,
      'success'
    );

    return { notifiedCount: overdueList.length, totalOverdue: totalAmount };
  };

  // Run initial overdue check on app startup
  useEffect(() => {
    checkAndTriggerOverdueAlerts(false);
  }, []);

  const resetAllData = () => {
    localStorage.removeItem('edupay_students');
    localStorage.removeItem('edupay_bills');
    localStorage.removeItem('edupay_transactions');
    localStorage.removeItem('edupay_notifications');
    localStorage.removeItem('edupay_school_info');
    localStorage.removeItem('edupay_users');
    localStorage.removeItem('edupay_current_user_id');
    localStorage.removeItem('edupay_student_accounts');
    setStudents(defaultStudents);
    setBills(defaultBills);
    setTransactions(defaultTransactions);
    setNotifications(defaultNotifications);
    setUsers(defaultUsers);
    setStudentAccounts(defaultStudentAccounts);
    setCurrentUserId('usr-001');
  };

  return (
    <AppContext.Provider value={{
      activeRole,
      setActiveRole,
      currentStudentId,
      setCurrentStudentId,
      currentStudent,
      students,
      bills,
      transactions,
      notifications,
      schoolInfo,
      unreadNotifCount,
      users,
      currentUser,
      setCurrentUserId,
      addUser,
      updateUser,
      deleteUser,
      resetUserPassword,
      updateUserPermissions,
      hasPermission,
      studentAccounts,
      currentStudentAccount,
      addStudentAccount,
      updateStudentAccount,
      deleteStudentAccount,
      resetStudentAccountPassword,
      updateStudentAccountPermissions,
      hasStudentPermission,
      studentLogin,
      studentLogout,
      changeCurrentStudentPassword,
      payBill,
      createBill,
      generateMonthlyBillsForClass,
      sendWhatsAppReminder,
      triggerPushNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetAllData,
      selectedReceiptTransaction,
      setSelectedReceiptTransaction,
      activePaymentBill,
      setActivePaymentBill,
      activeWhatsAppReminder,
      setActiveWhatsAppReminder,
      updateSchoolInfo,
      addStudent,
      addBatchStudents,
      updateStudent,
      deleteStudent,
      checkAndTriggerOverdueAlerts,
      blastOverdueWarnings,
      lastOverdueCheck
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
