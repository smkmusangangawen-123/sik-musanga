export type PaymentStatus = 'lunas' | 'belum_lunas' | 'sebagian' | 'menunggu_pembayaran' | 'jatuh_tempo';

export type BillType = 'spp' | 'uang_pengembangan' | 'ujian' | 'kegiatan';

export type PaymentChannel = 
  | 'qris' 
  | 'va_bca' 
  | 'va_mandiri' 
  | 'va_bri' 
  | 'va_bni' 
  | 'va_bsi'
  | 'gopay' 
  | 'ovo' 
  | 'dana' 
  | 'shopeepay'
  | 'alfamart' 
  | 'indomaret'
  | 'tunai_sekolah';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classGrade: string; // e.g. "X TKJ 1", "XI RPL 2", "XII TBSM 1"
  major: string; // "Teknik Komputer & Jaringan", "Rekayasa Perangkat Lunak", "Teknik Bisnis Sepeda Motor"
  parentName: string;
  parentPhone: string; // WhatsApp formatted (+628...)
  address: string;
  avatarUrl?: string;
  totalUangPengembangan: number;
  paidUangPengembangan: number;
  monthlySppAmount: number;
}

export interface Bill {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  title: string; // e.g. "SPP Oktober 2024", "Uang Pengembangan - Angsuran 2"
  type: BillType;
  month?: string; // e.g. "Oktober 2024"
  academicYear: string; // "2024/2025"
  amount: number;
  paidAmount: number;
  dueDate: string; // ISO date string e.g. "2024-10-10"
  status: PaymentStatus;
  createdAt: string;
  lastPaymentDate?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string; // e.g. "INV-202410-0012"
  receiptNumber: string; // e.g. "KWT-202410-0012"
  billId: string;
  billTitle: string;
  billType: BillType;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classGrade: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  channel: PaymentChannel;
  channelName: string;
  vaNumber?: string;
  status: 'berhasil' | 'menunggu' | 'gagal';
  paidAt: string;
  referenceNumber: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  studentId?: string;
  createdAt: string;
  read: boolean;
  linkAction?: string;
}

export interface SchoolInfo {
  name: string;
  shortName: string;
  npsn: string;
  akreditasi: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  headmaster: string;
  treasurerName: string;
  treasurerNip: string;
  logoUrl?: string;
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export type UserRole = 
  | 'super_admin'       // Administrator Utama (Hak akses penuh semua fitur & manajemen user)
  | 'bendahara'         // Bendahara / Admin Keuangan (Input transaksi, cetak kuitansi, export laporan, tagihan)
  | 'staff_tu'          // Staf Tata Usaha (Manajemen data siswa, import kelas, verifikasi berkas)
  | 'kepala_sekolah'    // Kepala Sekolah (View only: Monitoring dasbor keuangan & laporan audit)
  | 'wali_kelas';       // Wali Kelas (Monitoring pembayaran siswa kelas binaannya & kirim reminder WA)

export type PermissionKey =
  | 'manage_users'       // Tambah, hapus, reset akun pengguna & kelola hak akses
  | 'manage_students'    // Tambah, edit, hapus, import siswa
  | 'manage_bills'       // Buat, edit, blast tagihan SPP & Uang Pengembangan
  | 'process_payments'   // Input pembayaran loket tunai / verifikasi
  | 'export_reports'     // Ekspor laporan ke PDF, Excel, Word
  | 'edit_school_info'   // Edit identitas dan logo sekolah
  | 'view_financials'    // Akses dasbor keuangan dan statistik
  | 'send_reminders';    // Kirim notifikasi WA peringatan jatuh tempo

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  customPermissions?: PermissionKey[]; // If custom overrides are needed
  status: 'active' | 'suspended';
  assignedClass?: string; // For Wali Kelas e.g. "X TKJ 1"
  lastLogin?: string;
  createdAt: string;
  avatarUrl?: string;
}

export type StudentPermissionKey = 
  | 'pay_online'          // Akses bayar mandiri QRIS Dinamis & Virtual Account
  | 'download_receipt'    // Unduh/Cetak kuitansi pembayaran mandiri
  | 'view_history'        // Akses riwayat transaksi & mutasi pembayaran
  | 'update_contact';     // Perbarui nomor WA kontak orang tua mandiri

export interface StudentAccount {
  id: string;               // ID unik akun siswa e.g. "acc-std-001"
  studentId: string;        // ID Siswa terhubung
  nisn: string;             // Username login siswa
  password: string;         // Kata sandi login siswa
  status: 'active' | 'suspended';
  permissions: StudentPermissionKey[];
  lastLogin?: string;
  createdAt: string;
}

