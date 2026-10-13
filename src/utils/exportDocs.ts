import { Bill, SchoolInfo, Student } from '../types';
import { formatRupiah, formatDateIndo, terbilang } from './formatters';

interface ExportReportParams {
  bills: Bill[];
  students: Student[];
  schoolInfo: SchoolInfo;
  filterClass: string;
  filterStatus: string;
  filterType: string;
}

/**
 * Export full report table into Microsoft Word (.doc) with formal Kop Surat,
 * tables, totals, and signatures.
 */
export function exportReportToWord({
  bills,
  students,
  schoolInfo,
  filterClass,
  filterStatus,
  filterType
}: ExportReportParams) {
  const totalNominal = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalRemaining = totalNominal - totalPaid;
  const printDate = formatDateIndo(new Date().toISOString(), true);

  const tableRowsHtml = bills.map((b, idx) => {
    const st = students.find(s => s.id === b.studentId);
    const sisa = b.amount - b.paidAmount;
    const statusLabel = b.status === 'lunas' ? 'LUNAS' : b.status === 'jatuh_tempo' ? 'JATUH TEMPO' : 'BELUM LUNAS';
    const statusColor = b.status === 'lunas' ? '#166534' : b.status === 'jatuh_tempo' ? '#991b1b' : '#854d0e';

    return `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-family: monospace;">${st?.nisn || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold;">${b.studentName}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center;">${b.classGrade}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${b.title}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right;">${formatRupiah(b.amount)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; color: #166534; font-weight: bold;">${formatRupiah(b.paidAmount)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; color: #991b1b; font-weight: bold;">${formatRupiah(sisa)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center;">${formatDateIndo(b.dueDate)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; color: ${statusColor}; font-weight: bold;">${statusLabel}</td>
      </tr>
    `;
  }).join('');

  const htmlDoc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Laporan Keuangan - ${schoolInfo.name}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; margin: 20px; }
        .kop-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 15px; }
        .kop-title { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
        .kop-sub { font-size: 10pt; margin: 3px 0; }
        .doc-title { text-align: center; font-size: 13pt; font-weight: bold; text-decoration: underline; margin: 15px 0 5px 0; text-transform: uppercase; }
        .doc-meta { font-size: 10pt; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        th { background-color: #f1f5f9; border: 1px solid #94a3b8; padding: 8px; text-align: center; font-weight: bold; }
        .rekap-box { margin-top: 15px; border: 1px solid #cbd5e1; padding: 10px; background-color: #f8fafc; font-size: 10pt; }
        .ttd-table { width: 100%; margin-top: 30px; border: none; }
        .ttd-table td { border: none; text-align: center; font-size: 10.5pt; }
      </style>
    </head>
    <body>
      <div class="kop-header">
        <h1 class="kop-title">${schoolInfo.name}</h1>
        <div class="kop-sub">NPSN: ${schoolInfo.npsn} • Status Akreditasi: ${schoolInfo.akreditasi}</div>
        <div class="kop-sub">${schoolInfo.address}</div>
        <div class="kop-sub">Telp: ${schoolInfo.phone} • Email: ${schoolInfo.email} • Web: ${schoolInfo.website}</div>
      </div>

      <div class="doc-title">LAPORAN REKAPITULASI TAGIHAN DAN PEMBAYARAN KEUANGAN SISWA</div>
      
      <div class="doc-meta">
        <strong>Filter Kelas:</strong> ${filterClass} &nbsp;|&nbsp;
        <strong>Kategori:</strong> ${filterType.toUpperCase()} &nbsp;|&nbsp;
        <strong>Status:</strong> ${filterStatus.toUpperCase()} &nbsp;|&nbsp;
        <strong>Tanggal Dokumen:</strong> ${printDate}
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>NISN</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Uraian Tagihan</th>
            <th>Nominal (Rp)</th>
            <th>Terbayar (Rp)</th>
            <th>Sisa Piutang (Rp)</th>
            <th>Jatuh Tempo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="5" style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">TOTAL KESELURUHAN</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: right;">${formatRupiah(totalNominal)}</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: right; color: #166534;">${formatRupiah(totalPaid)}</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: right; color: #991b1b;">${formatRupiah(totalRemaining)}</td>
            <td colspan="2" style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">${bills.length} Data Transaksi</td>
          </tr>
        </tfoot>
      </table>

      <div class="rekap-box">
        <strong>Ringkasan Eksekutif Keuangan:</strong><br/>
        • Total Kewajiban Tercatat: <strong>${formatRupiah(totalNominal)}</strong> (${terbilang(totalNominal)})<br/>
        • Dana Berhasil Dihimpun (Lunas): <strong>${formatRupiah(totalPaid)}</strong><br/>
        • Sisa Piutang / Tunggakan Berjalan: <strong>${formatRupiah(totalRemaining)}</strong>
      </div>

      <table class="ttd-table">
        <tr>
          <td style="width: 50%;">
            Mengetahui,<br/>
            Kepala Sekolah ${schoolInfo.shortName}<br/><br/><br/><br/>
            <strong><u>${schoolInfo.headmaster}</u></strong><br/>
            NIP/NBM. -
          </td>
          <td style="width: 50%;">
            Gunungkidul, ${formatDateIndo(new Date().toISOString())}<br/>
            Bendahara Keuangan Sekolah<br/><br/><br/><br/>
            <strong><u>${schoolInfo.treasurerName}</u></strong><br/>
            NIP. ${schoolInfo.treasurerNip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Keuangan_${schoolInfo.shortName}_${filterClass.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export report to formatted Excel (.xls) table
 */
export function exportReportToExcel({
  bills,
  students,
  schoolInfo,
  filterClass,
  filterStatus,
  filterType
}: ExportReportParams) {
  const totalNominal = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalRemaining = totalNominal - totalPaid;

  const rows = bills.map((b, idx) => {
    const st = students.find(s => s.id === b.studentId);
    const sisa = b.amount - b.paidAmount;
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="mso-number-format:'\\@'; text-align: center;">${st?.nisn || ''}</td>
        <td>${b.studentName}</td>
        <td style="text-align: center;">${b.classGrade}</td>
        <td>${b.title}</td>
        <td>${b.type === 'spp' ? 'SPP Bulanan' : 'Uang Pengembangan'}</td>
        <td style="mso-number-format:'#,##0'; text-align: right;">${b.amount}</td>
        <td style="mso-number-format:'#,##0'; text-align: right;">${b.paidAmount}</td>
        <td style="mso-number-format:'#,##0'; text-align: right;">${sisa}</td>
        <td style="text-align: center;">${b.dueDate}</td>
        <td style="text-align: center; font-weight: bold;">${b.status.toUpperCase()}</td>
        <td>${st?.parentName || '-'}</td>
        <td style="mso-number-format:'\\@';">${st?.parentPhone || '-'}</td>
      </tr>
    `;
  }).join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Keuangan EduPay</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; }
        th { background-color: #047857; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
        td { border: 1px solid #cbd5e1; padding: 5px; font-size: 10pt; }
        .header-title { font-size: 14pt; font-weight: bold; text-align: center; }
        .sub-header { font-size: 10pt; text-align: center; color: #475569; }
        .footer-total { background-color: #e2e8f0; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="13" class="header-title">${schoolInfo.name.toUpperCase()}</td></tr>
        <tr><td colspan="13" class="sub-header">NPSN: ${schoolInfo.npsn} | Akreditasi: ${schoolInfo.akreditasi} | ${schoolInfo.address}</td></tr>
        <tr><td colspan="13" class="header-title" style="font-size: 12pt; text-decoration: underline;">REKAPITULASI PEMBAYARAN SPP &amp; UANG PENGEMBANGAN</td></tr>
        <tr><td colspan="13" class="sub-header">Filter Kelas: ${filterClass} | Status: ${filterStatus.toUpperCase()} | Dicetak: ${formatDateIndo(new Date().toISOString(), true)}</td></tr>
        <tr><td colspan="13"></td></tr>
        <thead>
          <tr>
            <th>No</th>
            <th>NISN</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Nama Tagihan</th>
            <th>Kategori</th>
            <th>Nominal Tagihan (IDR)</th>
            <th>Sudah Terbayar (IDR)</th>
            <th>Sisa Piutang (IDR)</th>
            <th>Batas Jatuh Tempo</th>
            <th>Status</th>
            <th>Nama Wali Murid</th>
            <th>No WhatsApp Wali</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr class="footer-total">
            <td colspan="6" style="text-align: center;">TOTAL KESELURUHAN</td>
            <td style="mso-number-format:'#,##0'; text-align: right;">${totalNominal}</td>
            <td style="mso-number-format:'#,##0'; text-align: right; color: #047857;">${totalPaid}</td>
            <td style="mso-number-format:'#,##0'; text-align: right; color: #b91c1c;">${totalRemaining}</td>
            <td colspan="4" style="text-align: center;">${bills.length} Data Tagihan Terfilter</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Keuangan_Excel_${schoolInfo.shortName}_${filterClass.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate formal Surat Pemberitahuan / Tagihan Siswa Individual in Word (.doc)
 */
export function exportIndividualBillWord(bill: Bill, student: Student, schoolInfo: SchoolInfo) {
  const sisa = bill.amount - bill.paidAmount;
  const printDate = formatDateIndo(new Date().toISOString());

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Surat Tagihan - ${student.name}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; color: #000; margin: 30px; line-height: 1.5; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px; }
        .kop h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
        .kop p { margin: 2px 0; font-size: 10pt; }
        .title { text-align: center; font-weight: bold; text-decoration: underline; margin: 20px 0 15px 0; font-size: 13pt; }
        .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .info-table td { padding: 5px; vertical-align: top; }
        .box { border: 1.5px solid #000; padding: 12px; margin: 15px 0; background-color: #f8fafc; }
        .ttd { width: 100%; margin-top: 40px; }
        .ttd td { text-align: center; }
      </style>
    </head>
    <body>
      <div class="kop">
        <h2>${schoolInfo.name}</h2>
        <p>NPSN: ${schoolInfo.npsn} • Status Akreditasi: ${schoolInfo.akreditasi}</p>
        <p>${schoolInfo.address}</p>
        <p>Telepon: ${schoolInfo.phone} • Email: ${schoolInfo.email}</p>
      </div>

      <table style="width: 100%;">
        <tr>
          <td>Nomor: 421/${bill.classGrade.split(' ')[1] || 'SMK'}/TAG/${new Date().getFullYear()}</td>
          <td style="text-align: right;">Gunungkidul, ${printDate}</td>
        </tr>
        <tr>
          <td>Hal: <strong>Surat Pemberitahuan Tagihan Administrasi Sekolah</strong></td>
          <td></td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        Kepada Yth.<br/>
        <strong>Bapak/Ibu Wali Murid dari ${student.name}</strong><br/>
        Kelas: ${student.classGrade} (NISN: ${student.nisn})<br/>
        di Tempat
      </p>

      <p>Dengan hormat,</p>
      <p>
        Berdasarkan pembukuan Bagian Keuangan ${schoolInfo.name}, kami memberitahukan kewajiban administrasi sekolah yang perlu diselesaikan:
      </p>

      <div class="box">
        <table class="info-table" style="margin: 0;">
          <tr>
            <td style="width: 200px;"><strong>Jenis Tagihan</strong></td>
            <td>: ${bill.title}</td>
          </tr>
          <tr>
            <td><strong>Nominal Kewajiban</strong></td>
            <td>: <strong>${formatRupiah(bill.amount)}</strong></td>
          </tr>
          <tr>
            <td><strong>Jumlah Terbayar</strong></td>
            <td>: ${formatRupiah(bill.paidAmount)}</td>
          </tr>
          <tr>
            <td><strong>Sisa yang Harus Dibayar</strong></td>
            <td>: <strong style="color: #991b1b; font-size: 13pt;">${formatRupiah(sisa)}</strong></td>
          </tr>
          <tr>
            <td><strong>Terbilang</strong></td>
            <td>: <em>${terbilang(sisa)}</em></td>
          </tr>
          <tr>
            <td><strong>Batas Jatuh Tempo</strong></td>
            <td>: <strong>${formatDateIndo(bill.dueDate)}</strong></td>
          </tr>
        </table>
      </div>

      <p>
        Pembayaran dapat dilakukan melalui loket Kasir Bendahara Sekolah atau melalui transfer / QRIS pada portal resmi <strong>EduPay</strong> sekolah.
      </p>
      <p>
        Apabila Bapak/Ibu telah melakukan pembayaran sebelum surat ini diterima, kami mohon bukti pembayaran dapat dikonfirmasikan kepada bendahara sekolah.
      </p>
      <p>Demikian surat pemberitahuan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>

      <table class="ttd">
        <tr>
          <td style="width: 50%;">
            Mengetahui,<br/>
            Kepala Sekolah,<br/><br/><br/><br/>
            <strong><u>${schoolInfo.headmaster}</u></strong>
          </td>
          <td style="width: 50%;">
            Bendahara Keuangan,<br/><br/><br/><br/>
            <strong><u>${schoolInfo.treasurerName}</u></strong><br/>
            NIP. ${schoolInfo.treasurerNip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Surat_Tagihan_${student.name.replace(/\s+/g, '_')}_${bill.title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download official CSV template for importing students
 */
export function downloadStudentTemplateCsv(schoolName: string = 'SMK Muhammadiyah 1 Ngawen') {
  const headers = [
    'NISN',
    'NIS',
    'Nama_Siswa',
    'Jenis_Kelamin',
    'Kelas',
    'Jurusan',
    'Nama_Wali',
    'No_WhatsApp_Wali',
    'Alamat',
    'SPP_Bulanan',
    'Uang_Pengembangan'
  ];

  const sampleRows = [
    [
      '0081298411',
      '221081',
      'Ahmad Rizky Pratama',
      'L',
      'X TKJ 1',
      'Teknik Komputer & Jaringan',
      'Budi Pratama',
      '081234567890',
      'Desa Jurangjero, Kec. Ngawen, Gunungkidul',
      '250000',
      '3500000'
    ],
    [
      '0081298412',
      '221082',
      'Siti Nur Azizah',
      'P',
      'X RPL 1',
      'Rekayasa Perangkat Lunak',
      'Bambang Supriyadi',
      '081398765432',
      'Sambirejo, Kec. Ngawen, Gunungkidul',
      '250000',
      '3500000'
    ],
    [
      '0072391083',
      '211045',
      'Bagus Satrio Nugroho',
      'L',
      'XI TBSM 1',
      'Teknik Bisnis Sepeda Motor',
      'Suryanto Nugroho',
      '085712348901',
      'Watusigar, Kec. Ngawen, Gunungkidul',
      '240000',
      '3200000'
    ],
    [
      '0068192034',
      '201018',
      'Dewi Lestari Putri',
      'P',
      'XII AKL 1',
      'Akuntansi & Keuangan Lembaga',
      'Mulyadi',
      '085234567812',
      'Tancep, Kec. Ngawen, Gunungkidul',
      '230000',
      '3000000'
    ]
  ];

  const csvContent = '\ufeff' + [
    headers.join(','),
    ...sampleRows.map(row => row.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Template_Import_Siswa_EduPay_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download official Excel (.xls) template for importing students with formatting & guidelines
 */
export function downloadStudentTemplateExcel(schoolName: string = 'SMK Muhammadiyah 1 Ngawen') {
  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Template Data Siswa</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 11pt; }
        th { background-color: #047857; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px; text-align: center; }
        td { border: 1px solid #cbd5e1; padding: 6px; }
        .instruksi { background-color: #f8fafc; font-size: 10pt; color: #334155; }
        .header-title { font-size: 14pt; font-weight: bold; text-align: center; color: #0f172a; }
        .sub-header { font-size: 10.5pt; text-align: center; color: #475569; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="11" class="header-title">TEMPLATE DATA SISWA RESMI - ${schoolName.toUpperCase()}</td></tr>
        <tr><td colspan="11" class="sub-header">Gunakan berkas ini untuk menambahkan siswa per kelas dan per jurusan secara massal. Isi data mulai baris ke-6.</td></tr>
        <tr><td colspan="11" class="instruksi">PETUNJUK: Kolom bertanda (*) Wajib diisi. Jenis Kelamin diisi 'L' (Laki-laki) atau 'P' (Perempuan). Nomor WA diawali 08...</td></tr>
        <tr><td colspan="11"></td></tr>
        <thead>
          <tr>
            <th>NISN*</th>
            <th>NIS*</th>
            <th>Nama_Siswa*</th>
            <th>Jenis_Kelamin* (L/P)</th>
            <th>Kelas*</th>
            <th>Jurusan*</th>
            <th>Nama_Wali*</th>
            <th>No_WhatsApp_Wali*</th>
            <th>Alamat</th>
            <th>SPP_Bulanan (IDR)</th>
            <th>Uang_Pengembangan (IDR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="mso-number-format:'\\@'; text-align:center;">0081298411</td>
            <td style="mso-number-format:'\\@'; text-align:center;">221081</td>
            <td>Ahmad Rizky Pratama</td>
            <td style="text-align:center;">L</td>
            <td style="text-align:center; font-weight:bold;">X TKJ 1</td>
            <td>Teknik Komputer & Jaringan</td>
            <td>Budi Pratama</td>
            <td style="mso-number-format:'\\@';">081234567890</td>
            <td>Desa Jurangjero, Kec. Ngawen, Gunungkidul</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">250000</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">3500000</td>
          </tr>
          <tr>
            <td style="mso-number-format:'\\@'; text-align:center;">0081298412</td>
            <td style="mso-number-format:'\\@'; text-align:center;">221082</td>
            <td>Siti Nur Azizah</td>
            <td style="text-align:center;">P</td>
            <td style="text-align:center; font-weight:bold;">X RPL 1</td>
            <td>Rekayasa Perangkat Lunak</td>
            <td>Bambang Supriyadi</td>
            <td style="mso-number-format:'\\@';">081398765432</td>
            <td>Sambirejo, Kec. Ngawen, Gunungkidul</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">250000</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">3500000</td>
          </tr>
          <tr>
            <td style="mso-number-format:'\\@'; text-align:center;">0072391083</td>
            <td style="mso-number-format:'\\@'; text-align:center;">211045</td>
            <td>Bagus Satrio Nugroho</td>
            <td style="text-align:center;">L</td>
            <td style="text-align:center; font-weight:bold;">XI TBSM 1</td>
            <td>Teknik Bisnis Sepeda Motor</td>
            <td>Suryanto Nugroho</td>
            <td style="mso-number-format:'\\@';">085712348901</td>
            <td>Watusigar, Kec. Ngawen, Gunungkidul</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">240000</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">3200000</td>
          </tr>
          <tr>
            <td style="mso-number-format:'\\@'; text-align:center;">0068192034</td>
            <td style="mso-number-format:'\\@'; text-align:center;">201018</td>
            <td>Dewi Lestari Putri</td>
            <td style="text-align:center;">P</td>
            <td style="text-align:center; font-weight:bold;">XII AKL 1</td>
            <td>Akuntansi & Keuangan Lembaga</td>
            <td>Mulyadi</td>
            <td style="mso-number-format:'\\@';">085234567812</td>
            <td>Tancep, Kec. Ngawen, Gunungkidul</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">230000</td>
            <td style="mso-number-format:'#,##0'; text-align:right;">3000000</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Template_Data_Siswa_Excel_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

