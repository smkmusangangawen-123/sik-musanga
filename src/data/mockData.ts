import { 
  Student, 
  Bill, 
  Transaction, 
  SchoolInfo, 
  NotificationItem, 
  StudentAccount, 
  StudentPermissionKey 
} from '../types';

export const defaultSchoolInfo: SchoolInfo = {
  name: 'SMK Muhammadiyah 1 Ngawen',
  shortName: 'SMK Musanga',
  npsn: '20402115',
  akreditasi: 'A (Unggul)',
  address: 'Jl. Raya Ngawen - Cawas Km. 1, Gunungkidul, D.I. Yogyakarta 55853',
  phone: '(0274) 391823 / 0812-2890-4411',
  email: 'smkmusangangawen@gmail.com',
  website: 'smkmuh1ngawen.sch.id',
  headmaster: 'Drs. H. Ahmad Sudarsono, M.Pd.',
  treasurerName: 'Siti Rahmawati, S.E.',
  treasurerNip: '19840512 201001 2 018',
  bankAccount: {
    bank: 'Bank BPD DIY Syariah & Bank Mandiri',
    accountNumber: '102.21.00034.1',
    accountHolder: 'SMK Muhammadiyah 1 Ngawen - Rekening Keuangan SPP'
  }
};

export const defaultStudents: Student[] = [
  {
    id: 'std-001',
    nisn: '0078129031',
    nis: '221041',
    name: 'Muhammad Rizky Pratama',
    gender: 'L',
    classGrade: 'X TKJ 1',
    major: 'Teknik Komputer & Jaringan',
    parentName: 'Hendra Pratama',
    parentPhone: '081234567890',
    address: 'Desa Jurangjero, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3500000,
    paidUangPengembangan: 2500000,
    monthlySppAmount: 250000,
  },
  {
    id: 'std-002',
    nisn: '0076239102',
    nis: '221042',
    name: 'Anisa Nur Aulia',
    gender: 'P',
    classGrade: 'X RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    parentName: 'Bambang Supriyadi',
    parentPhone: '081398765432',
    address: 'Sambirejo, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3500000,
    paidUangPengembangan: 3500000,
    monthlySppAmount: 250000,
  },
  {
    id: 'std-003',
    nisn: '0067341098',
    nis: '211019',
    name: 'Dimas Aditya Nugraha',
    gender: 'L',
    classGrade: 'XI TBSM 1',
    major: 'Teknik Bisnis Sepeda Motor',
    parentName: 'Suryanto Nugroho',
    parentPhone: '085712348901',
    address: 'Watusigar, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3200000,
    paidUangPengembangan: 1600000,
    monthlySppAmount: 240000,
  },
  {
    id: 'std-004',
    nisn: '0068452174',
    nis: '211025',
    name: 'Dewi Lestari Kusuma',
    gender: 'P',
    classGrade: 'XI RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    parentName: 'Supardi',
    parentPhone: '087834561234',
    address: 'Gari, Kec. Wonosari, Gunungkidul',
    totalUangPengembangan: 3200000,
    paidUangPengembangan: 3200000,
    monthlySppAmount: 240000,
  },
  {
    id: 'std-005',
    nisn: '0059123847',
    nis: '201008',
    name: 'Fajar Kurniawan',
    gender: 'L',
    classGrade: 'XII TKJ 1',
    major: 'Teknik Komputer & Jaringan',
    parentName: 'Agus Salim',
    parentPhone: '082156789123',
    address: 'Beji, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3000000,
    paidUangPengembangan: 3000000,
    monthlySppAmount: 230000,
  },
  {
    id: 'std-006',
    nisn: '0058234910',
    nis: '201015',
    name: 'Siti Zahra Maulida',
    gender: 'P',
    classGrade: 'XII AKL 1',
    major: 'Akuntansi & Keuangan Lembaga',
    parentName: 'Mulyadi',
    parentPhone: '085234567812',
    address: 'Tancep, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3000000,
    paidUangPengembangan: 2000000,
    monthlySppAmount: 230000,
  },
  {
    id: 'std-007',
    nisn: '0079012384',
    nis: '221055',
    name: 'Bagus Satrio Utomo',
    gender: 'L',
    classGrade: 'X TKJ 1',
    major: 'Teknik Komputer & Jaringan',
    parentName: 'Triyono Utomo',
    parentPhone: '081299887766',
    address: 'Candi, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3500000,
    paidUangPengembangan: 1000000,
    monthlySppAmount: 250000,
  },
  {
    id: 'std-008',
    nisn: '0069128374',
    nis: '211044',
    name: 'Nadia Putri Anggraini',
    gender: 'P',
    classGrade: 'XI TBSM 1',
    major: 'Teknik Bisnis Sepeda Motor',
    parentName: 'Sugeng Widodo',
    parentPhone: '081901234567',
    address: 'Jurangjero, Kec. Ngawen, Gunungkidul',
    totalUangPengembangan: 3200000,
    paidUangPengembangan: 2400000,
    monthlySppAmount: 240000,
  }
];

export const defaultBills: Bill[] = [
  // Student 1 (Rizky)
  {
    id: 'bill-101',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'SPP Juli 2024',
    type: 'spp',
    month: 'Juli 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 250000,
    dueDate: '2024-07-10',
    status: 'lunas',
    createdAt: '2024-07-01',
    lastPaymentDate: '2024-07-08'
  },
  {
    id: 'bill-102',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'SPP Agustus 2024',
    type: 'spp',
    month: 'Agustus 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 250000,
    dueDate: '2024-08-10',
    status: 'lunas',
    createdAt: '2024-08-01',
    lastPaymentDate: '2024-08-05'
  },
  {
    id: 'bill-103',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'SPP September 2024',
    type: 'spp',
    month: 'September 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 250000,
    dueDate: '2024-09-10',
    status: 'lunas',
    createdAt: '2024-09-01',
    lastPaymentDate: '2024-09-09'
  },
  {
    id: 'bill-104',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'SPP Oktober 2024',
    type: 'spp',
    month: 'Oktober 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 0,
    dueDate: '2024-10-10',
    status: 'jatuh_tempo',
    createdAt: '2024-10-01'
  },
  {
    id: 'bill-105',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'SPP November 2024',
    type: 'spp',
    month: 'November 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 0,
    dueDate: '2024-11-10',
    status: 'belum_lunas',
    createdAt: '2024-10-01'
  },
  {
    id: 'bill-106',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'Uang Pengembangan - Tahap 1',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 1500000,
    paidAmount: 1500000,
    dueDate: '2024-07-20',
    status: 'lunas',
    createdAt: '2024-07-01',
    lastPaymentDate: '2024-07-15'
  },
  {
    id: 'bill-107',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'Uang Pengembangan - Tahap 2',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 1000000,
    paidAmount: 1000000,
    dueDate: '2024-09-30',
    status: 'lunas',
    createdAt: '2024-07-01',
    lastPaymentDate: '2024-09-28'
  },
  {
    id: 'bill-108',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    classGrade: 'X TKJ 1',
    title: 'Uang Pengembangan - Tahap 3 (Pelunasan)',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 1000000,
    paidAmount: 0,
    dueDate: '2024-12-20',
    status: 'belum_lunas',
    createdAt: '2024-07-01'
  },

  // Student 2 (Anisa) - Lunas Semua
  {
    id: 'bill-201',
    studentId: 'std-002',
    studentName: 'Anisa Nur Aulia',
    classGrade: 'X RPL 1',
    title: 'SPP Oktober 2024',
    type: 'spp',
    month: 'Oktober 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 250000,
    dueDate: '2024-10-10',
    status: 'lunas',
    createdAt: '2024-10-01',
    lastPaymentDate: '2024-10-02'
  },
  {
    id: 'bill-202',
    studentId: 'std-002',
    studentName: 'Anisa Nur Aulia',
    classGrade: 'X RPL 1',
    title: 'Uang Pengembangan (Lunas Penuh)',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 3500000,
    paidAmount: 3500000,
    dueDate: '2024-07-20',
    status: 'lunas',
    createdAt: '2024-07-01',
    lastPaymentDate: '2024-07-12'
  },

  // Student 3 (Dimas) - Tunggakan
  {
    id: 'bill-301',
    studentId: 'std-003',
    studentName: 'Dimas Aditya Nugraha',
    classGrade: 'XI TBSM 1',
    title: 'SPP September 2024',
    type: 'spp',
    month: 'September 2024',
    academicYear: '2024/2025',
    amount: 240000,
    paidAmount: 0,
    dueDate: '2024-09-10',
    status: 'jatuh_tempo',
    createdAt: '2024-09-01'
  },
  {
    id: 'bill-302',
    studentId: 'std-003',
    studentName: 'Dimas Aditya Nugraha',
    classGrade: 'XI TBSM 1',
    title: 'SPP Oktober 2024',
    type: 'spp',
    month: 'Oktober 2024',
    academicYear: '2024/2025',
    amount: 240000,
    paidAmount: 0,
    dueDate: '2024-10-10',
    status: 'jatuh_tempo',
    createdAt: '2024-10-01'
  },
  {
    id: 'bill-303',
    studentId: 'std-003',
    studentName: 'Dimas Aditya Nugraha',
    classGrade: 'XI TBSM 1',
    title: 'Uang Pengembangan - Termin 2',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 1600000,
    paidAmount: 0,
    dueDate: '2024-10-25',
    status: 'belum_lunas',
    createdAt: '2024-07-01'
  },

  // Student 7 (Bagus)
  {
    id: 'bill-701',
    studentId: 'std-007',
    studentName: 'Bagus Satrio Utomo',
    classGrade: 'X TKJ 1',
    title: 'SPP Oktober 2024',
    type: 'spp',
    month: 'Oktober 2024',
    academicYear: '2024/2025',
    amount: 250000,
    paidAmount: 0,
    dueDate: '2024-10-10',
    status: 'jatuh_tempo',
    createdAt: '2024-10-01'
  },
  {
    id: 'bill-702',
    studentId: 'std-007',
    studentName: 'Bagus Satrio Utomo',
    classGrade: 'X TKJ 1',
    title: 'Uang Pengembangan - Termin 2',
    type: 'uang_pengembangan',
    academicYear: '2024/2025',
    amount: 1250000,
    paidAmount: 0,
    dueDate: '2024-10-20',
    status: 'belum_lunas',
    createdAt: '2024-07-01'
  }
];

export const defaultTransactions: Transaction[] = [
  {
    id: 'trx-1001',
    invoiceNumber: 'INV-202409-0042',
    receiptNumber: 'KWT-2024/TKJ/09/0042',
    billId: 'bill-103',
    billTitle: 'SPP September 2024',
    billType: 'spp',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    studentNisn: '0078129031',
    classGrade: 'X TKJ 1',
    amount: 250000,
    adminFee: 2500,
    totalAmount: 252500,
    channel: 'qris',
    channelName: 'QRIS Dinamis (Gopay/ShopeePay)',
    status: 'berhasil',
    paidAt: '2024-09-09T14:22:10Z',
    referenceNumber: 'QRIS-882910398',
    notes: 'Pelunasan SPP tepat waktu'
  },
  {
    id: 'trx-1002',
    invoiceNumber: 'INV-202409-0089',
    receiptNumber: 'KWT-2024/TKJ/09/0089',
    billId: 'bill-107',
    billTitle: 'Uang Pengembangan - Tahap 2',
    billType: 'uang_pengembangan',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    studentNisn: '0078129031',
    classGrade: 'X TKJ 1',
    amount: 1000000,
    adminFee: 4000,
    totalAmount: 1004000,
    channel: 'va_bri',
    channelName: 'BRIVA (BRI Virtual Account)',
    vaNumber: '782910078129031',
    status: 'berhasil',
    paidAt: '2024-09-28T09:15:32Z',
    referenceNumber: 'BRIVA-99120349'
  },
  {
    id: 'trx-1003',
    invoiceNumber: 'INV-202410-0005',
    receiptNumber: 'KWT-2024/RPL/10/0005',
    billId: 'bill-201',
    billTitle: 'SPP Oktober 2024',
    billType: 'spp',
    studentId: 'std-002',
    studentName: 'Anisa Nur Aulia',
    studentNisn: '0076239102',
    classGrade: 'X RPL 1',
    amount: 250000,
    adminFee: 0,
    totalAmount: 250000,
    channel: 'tunai_sekolah',
    channelName: 'Loket Kasir Bendahara Sekolah',
    status: 'berhasil',
    paidAt: '2024-10-02T10:05:00Z',
    referenceNumber: 'KSR-20241002-01'
  },
  {
    id: 'trx-1004',
    invoiceNumber: 'INV-202408-0112',
    receiptNumber: 'KWT-2024/TKJ/08/0112',
    billId: 'bill-102',
    billTitle: 'SPP Agustus 2024',
    billType: 'spp',
    studentId: 'std-001',
    studentName: 'Muhammad Rizky Pratama',
    studentNisn: '0078129031',
    classGrade: 'X TKJ 1',
    amount: 250000,
    adminFee: 3000,
    totalAmount: 253000,
    channel: 'va_bca',
    channelName: 'BCA Virtual Account',
    vaNumber: '12890078129031',
    status: 'berhasil',
    paidAt: '2024-08-05T11:45:00Z',
    referenceNumber: 'BCA-77123912'
  }
];

export const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pemberitahuan Jatuh Tempo SPP',
    message: 'Tagihan SPP Bulan Oktober 2024 telah jatuh tempo pada tanggal 10 Oktober 2024.',
    type: 'warning',
    studentId: 'std-001',
    createdAt: '2024-10-11T08:00:00Z',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Pembayaran Berhasil Diterima',
    message: 'Pembayaran Uang Pengembangan Tahap 2 sebesar Rp 1.000.000 via BRIVA telah berhasil divalidasi.',
    type: 'success',
    studentId: 'std-001',
    createdAt: '2024-09-28T09:16:00Z',
    read: true
  },
  {
    id: 'notif-3',
    title: 'Jadwal Pembayaran Uang Pengembangan Tahap 3',
    message: 'Batas akhir pelunasan Uang Pengembangan Tahap 3 adalah 20 Desember 2024.',
    type: 'info',
    createdAt: '2024-10-01T07:30:00Z',
    read: false
  }
];

export const ROLE_CONFIG: Record<string, {
  label: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  defaultPermissions: import('../types').PermissionKey[];
}> = {
  super_admin: {
    label: 'Super Admin',
    badgeColor: 'text-purple-700',
    badgeBg: 'bg-purple-100 border-purple-200',
    description: 'Hak akses tertinggi: Mengelola seluruh modul, database siswa, tagihan, dan manajemen hak akses pengguna.',
    defaultPermissions: [
      'manage_users',
      'manage_students',
      'manage_bills',
      'process_payments',
      'export_reports',
      'edit_school_info',
      'view_financials',
      'send_reminders'
    ]
  },
  bendahara: {
    label: 'Bendahara Sekolah',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 border-emerald-200',
    description: 'Pengelola transaksi harian loket, validasi transfer, penerbitan kuitansi, export laporan dan pembuatan tagihan.',
    defaultPermissions: [
      'manage_bills',
      'process_payments',
      'export_reports',
      'view_financials',
      'send_reminders'
    ]
  },
  staff_tu: {
    label: 'Staf Tata Usaha',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-100 border-blue-200',
    description: 'Pengelola data induk siswa, upload berkas template excel per kelas/jurusan, dan arsip data akademik.',
    defaultPermissions: [
      'manage_students',
      'send_reminders',
      'view_financials'
    ]
  },
  kepala_sekolah: {
    label: 'Kepala Sekolah',
    badgeColor: 'text-amber-800',
    badgeBg: 'bg-amber-100 border-amber-200',
    description: 'Monitoring eksekutif penerimaan kas SPP, audit laporan keuangan, dan verifikasi profil sekolah (View-Only Keuangan).',
    defaultPermissions: [
      'view_financials',
      'export_reports'
    ]
  },
  wali_kelas: {
    label: 'Wali Kelas',
    badgeColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-100 border-indigo-200',
    description: 'Pemantauan status tunggakan siswa di kelas binaan serta broadcast notifikasi penagihan via WhatsApp.',
    defaultPermissions: [
      'view_financials',
      'send_reminders'
    ]
  }
};

export const ALL_PERMISSIONS_LIST: Array<{ key: import('../types').PermissionKey; label: string; desc: string; category: string }> = [
  { key: 'manage_users', label: 'Manajemen Pengguna & Role', desc: 'Tambah, hapus, reset password, dan ubah hak akses staf', category: 'Administrasi Sistem' },
  { key: 'manage_students', label: 'Manajemen Data Siswa', desc: 'Tambah manual, edit, hapus, dan import file template siswa', category: 'Kesiswaan' },
  { key: 'manage_bills', label: 'Kelola Tagihan SPP & Uang Gedung', desc: 'Buat tagihan baru per kelas/jurusan dan setting tarif', category: 'Keuangan' },
  { key: 'process_payments', label: 'Input Pembayaran & Loket', desc: 'Proses pembayaran loket, cetak kuitansi resmi sekolah', category: 'Keuangan' },
  { key: 'export_reports', label: 'Ekspor Dokumen Laporan', desc: 'Unduh laporan formal dalam format PDF, Word (DOCX), dan Excel', category: 'Pelaporan' },
  { key: 'view_financials', label: 'Lihat Dasbor & Statistik', desc: 'Akses statistik real-time, grafik arus kas, dan daftar transaksi', category: 'Pelaporan' },
  { key: 'send_reminders', label: 'Kirim Peringatan Jatuh Tempo', desc: 'Kirim notifikasi push dan broadcast WhatsApp penagihan', category: 'Komunikasi' },
  { key: 'edit_school_info', label: 'Edit Identitas & Logo Sekolah', desc: 'Perbarui nama sekolah, kop surat, stempel, dan logo resmi', category: 'Pengaturan' }
];

export const defaultUsers: import('../types').AppUser[] = [
  {
    id: 'usr-001',
    username: 'admin.utama',
    fullName: 'Bambang Irawan, S.Kom.',
    email: 'smkmusangangawen@gmail.com',
    phone: '0812-2890-4411',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2024-10-12 08:30 WIB',
    createdAt: '2023-01-15'
  },
  {
    id: 'usr-002',
    username: 'siti.bendahara',
    fullName: 'Siti Rahmawati, S.E.',
    email: 'bendahara@smkmuh1ngawen.sch.id',
    phone: '0813-8822-1920',
    role: 'bendahara',
    status: 'active',
    lastLogin: '2024-10-12 09:15 WIB',
    createdAt: '2023-02-01'
  },
  {
    id: 'usr-003',
    username: 'ahmad.tu',
    fullName: 'Ahmad Fauzi, A.Md.',
    email: 'tu.kesiswaan@smkmuh1ngawen.sch.id',
    phone: '0857-4321-9988',
    role: 'staff_tu',
    status: 'active',
    lastLogin: '2024-10-11 14:00 WIB',
    createdAt: '2023-03-10'
  },
  {
    id: 'usr-004',
    username: 'kepsek.ahmad',
    fullName: 'Drs. H. Ahmad Sudarsono, M.Pd.',
    email: 'kepsek@smkmuh1ngawen.sch.id',
    phone: '0811-2233-4455',
    role: 'kepala_sekolah',
    status: 'active',
    lastLogin: '2024-10-10 10:20 WIB',
    createdAt: '2023-01-10'
  },
  {
    id: 'usr-005',
    username: 'eko.walitkj',
    fullName: 'Eko Wahyudi, S.T.',
    email: 'eko.wahyudi@smkmuh1ngawen.sch.id',
    phone: '0821-3344-5566',
    role: 'wali_kelas',
    assignedClass: 'X TKJ 1',
    status: 'active',
    lastLogin: '2024-10-12 07:45 WIB',
    createdAt: '2023-07-01'
  }
];

export const ALL_STUDENT_PERMISSIONS_LIST: {
  key: StudentPermissionKey;
  label: string;
  desc: string;
}[] = [
  { 
    key: 'pay_online', 
    label: 'Bayar Mandiri Online (QRIS & Virtual Account)', 
    desc: 'Siswa & orang tua diizinkan melakukan pembayaran langsung melalui gateway QRIS Dinamis dan Virtual Account bank.' 
  },
  { 
    key: 'download_receipt', 
    label: 'Cetak & Unduh Kuitansi Mandiri', 
    desc: 'Siswa & wali berhak mencetak kuitansi resmi pembayaran berformat PDF dengan stempel dan QR validasi.' 
  },
  { 
    key: 'view_history', 
    label: 'Akses Riwayat Pembayaran & Mutasi', 
    desc: 'Siswa dapat melihat rekapitulasi histori transaksi dan rincian alokasi dana masa lalu.' 
  },
  { 
    key: 'update_contact', 
    label: 'Perbarui Kontak WhatsApp Orang Tua', 
    desc: 'Siswa diizinkan memperbarui nomor handphone/WA wali murid untuk penerimaan notifikasi penagihan.' 
  }
];

export const defaultStudentAccounts: StudentAccount[] = [
  {
    id: 'acc-std-001',
    studentId: 'std-001',
    nisn: '0078129031',
    password: '0078129031',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-12 10:15 WIB',
    createdAt: '2023-07-15'
  },
  {
    id: 'acc-std-002',
    studentId: 'std-002',
    nisn: '0076239102',
    password: '0076239102',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-11 16:30 WIB',
    createdAt: '2023-07-15'
  },
  {
    id: 'acc-std-003',
    studentId: 'std-003',
    nisn: '0067341098',
    password: '0067341098',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-09 11:20 WIB',
    createdAt: '2022-07-15'
  },
  {
    id: 'acc-std-004',
    studentId: 'std-004',
    nisn: '0068452119',
    password: '0068452119',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-10 14:05 WIB',
    createdAt: '2022-07-15'
  },
  {
    id: 'acc-std-005',
    studentId: 'std-005',
    nisn: '0071928374',
    password: '0071928374',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-08 09:40 WIB',
    createdAt: '2023-07-15'
  },
  {
    id: 'acc-std-006',
    studentId: 'std-006',
    nisn: '0074829103',
    password: '0074829103',
    status: 'suspended',
    permissions: ['view_history'],
    lastLogin: '2024-09-28 13:10 WIB',
    createdAt: '2023-07-15'
  },
  {
    id: 'acc-std-007',
    studentId: 'std-007',
    nisn: '0069384721',
    password: '0069384721',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-05 15:45 WIB',
    createdAt: '2022-07-15'
  },
  {
    id: 'acc-std-008',
    studentId: 'std-008',
    nisn: '0073849102',
    password: '0073849102',
    status: 'active',
    permissions: ['pay_online', 'download_receipt', 'view_history', 'update_contact'],
    lastLogin: '2024-10-12 08:00 WIB',
    createdAt: '2023-07-15'
  }
];

