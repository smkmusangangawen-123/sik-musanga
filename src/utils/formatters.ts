/**
 * Format number to Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string into Indonesian standard date format
 * e.g. "2024-10-15" -> "15 Oktober 2024"
 */
export function formatDateIndo(dateStr: string, withTime = false): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' } : {})
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Convert number to words in Indonesian (Terbilang)
 * e.g. 350000 -> "Tiga Ratus Lima Puluh Ribu Rupiah"
 */
export function terbilang(n: number): string {
  if (n < 0) return 'Minus ' + terbilang(Math.abs(n));
  if (n === 0) return 'Nol Rupiah';

  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convert(num: number): string {
    if (num < 12) return units[num];
    if (num < 20) return convert(num - 10) + ' Belas';
    if (num < 100) return convert(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + convert(num % 10) : '');
    if (num < 200) return 'Seratus' + (num - 100 !== 0 ? ' ' + convert(num - 100) : '');
    if (num < 1000) return convert(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
    if (num < 2000) return 'Seribu' + (num - 1000 !== 0 ? ' ' + convert(num - 1000) : '');
    if (num < 1000000) return convert(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
    if (num < 1000000000) return convert(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + convert(num % 1000000) : '');
    if (num < 1000000000000) return convert(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + convert(num % 1000000000) : '');
    return 'Jumlah Sangat Besar';
  }

  const result = convert(Math.floor(n)).trim();
  return (result + ' Rupiah').replace(/\s+/g, ' ');
}

/**
 * Generate clean Indonesian WhatsApp link with formatted reminder message
 */
export function createWhatsAppReminderUrl(params: {
  phone: string;
  studentName: string;
  parentName: string;
  classGrade: string;
  billTitle: string;
  amount: number;
  dueDate: string;
  schoolName: string;
}): { url: string; message: string; cleanPhone: string } {
  // Clean phone to format: 628...
  let phone = params.phone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  const message = `*PEMBERITAHUAN TAGIHAN SEKOLAH - ${params.schoolName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${params.parentName}*
(Wali dari *${params.studentName}* - Kelas ${params.classGrade})

Dengan hormat,
Kami menginformasikan rincian kewajiban administrasi sekolah yang perlu diselesaikan:

📌 *Jenis Tagihan:* ${params.billTitle}
💰 *Nomor Nominal:* ${formatRupiah(params.amount)}
📅 *Jatuh Tempo:* ${formatDateIndo(params.dueDate)}

Pembayaran dapat dilakukan melalui *Portal EduPay Siswa* (mendukung QRIS, Virtual Account BCA/BRI/BNI/Mandiri, E-Wallet, atau langsung di loket kasir sekolah).

Apabila Bapak/Ibu telah melakukan pembayaran, mohon abaikan pesan pengingat ini.

_Terima kasih atas perhatian dan kerja sama Bapak/Ibu sekalian._
Salam hormat,
*Bagian Keuangan & Administrasi ${params.schoolName}*`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;

  return { url, message, cleanPhone: phone };
}

/**
 * Calculate how many days a bill is past its due date
 * Returns 0 if not yet overdue, or >0 if overdue
 */
export function getDaysOverdue(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  try {
    const due = new Date(dueDateStr);
    // Normalize to date comparison (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
}

/**
 * Generate formal urgent WhatsApp warning for overdue bill
 */
export function createOverdueWhatsAppUrl(params: {
  phone: string;
  studentName: string;
  parentName: string;
  classGrade: string;
  billTitle: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  schoolName: string;
}): { url: string; message: string; cleanPhone: string } {
  let phone = params.phone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  else if (!phone.startsWith('62')) phone = '62' + phone;

  const message = `*⚠️ SURAT PERINGATAN KETERLAMBATAN (SP-1) - ${params.schoolName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${params.parentName}*
(Wali Murid dari *${params.studentName}* - Kelas ${params.classGrade})

Dengan hormat,
Berdasarkan sistem pemantauan keuangan sekolah, kami menginformasikan bahwa tagihan berikut telah *MELEWATI BATAS JATUH TEMPO*:

📌 *Jenis Tagihan:* ${params.billTitle}
💰 *Nominal Tunggakan:* ${formatRupiah(params.amount)}
📅 *Batas Jatuh Tempo:* ${formatDateIndo(params.dueDate)}
⏱️ *Keterlambatan:* *${params.daysOverdue} Hari Terlambat*

Mohon untuk segera melakukan pelunasan melalui *Portal EduPay Siswa* (mendukung QRIS instan, Virtual Account Bank BRI/BCA/Mandiri/BNI/BSI) atau langsung ke Loket Kasir Bendahara Sekolah guna menghindari penundaan penerbitan kartu ujian / administrasi akademik siswa.

Bila Bapak/Ibu memiliki kendala finansial, silakan berkoordinasi langsung dengan pihak Bendahara Sekolah.

_Terima kasih atas kerja sama dan pengertiannya._
Hormat kami,
*Bagian Keuangan & Administrasi ${params.schoolName}*`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;
  return { url, message, cleanPhone: phone };
}

