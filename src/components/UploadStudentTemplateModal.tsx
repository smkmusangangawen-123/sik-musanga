import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  Check, 
  ArrowRight,
  FileCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { formatRupiah } from '../utils/formatters';
import { downloadStudentTemplateExcel, downloadStudentTemplateCsv } from '../utils/exportDocs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classGrade: string;
  major: string;
  parentName: string;
  parentPhone: string;
  address: string;
  monthlySppAmount: number;
  totalUangPengembangan: number;
  isValid: boolean;
  errorNote?: string;
}

export const UploadStudentTemplateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { schoolInfo, addBatchStudents } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState<'download' | 'upload'>('download');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [autoCreateBills, setAutoCreateBills] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Clean and parse text content from CSV / TSV / text files
  const parseFileContent = (content: string) => {
    setErrorMessage('');
    const lines = content.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      setErrorMessage('Berkas kosong atau tidak ada data yang terbaca.');
      return;
    }

    const rows: ParsedRow[] = [];

    // Check if line 1 or 2 is header
    lines.forEach((line) => {
      // Ignore comments or title lines
      if (line.toUpperCase().includes('TEMPLATE DATA SISWA') || line.toUpperCase().includes('PETUNJUK:')) {
        return;
      }

      // Check delimiters: comma, semicolon, or tab
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else {
        // Parse CSV with quotes support
        const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
          parts.push(val !== undefined ? val.trim() : '');
        }
      }

      // Skip header row
      const firstCol = parts[0]?.trim().toUpperCase();
      if (firstCol === 'NISN' || firstCol === 'NISN*' || firstCol.startsWith('NO')) {
        return;
      }

      // We expect at least NISN and Name
      if (parts.length >= 3) {
        const nisn = parts[0]?.trim() || '';
        const nis = parts[1]?.trim() || '';
        const name = parts[2]?.trim() || '';
        const genderRaw = parts[3]?.trim().toUpperCase();
        const gender: 'L' | 'P' = genderRaw === 'P' ? 'P' : 'L';
        const classGrade = parts[4]?.trim() || 'X TKJ 1';
        const major = parts[5]?.trim() || 'Teknik Komputer & Jaringan';
        const parentName = parts[6]?.trim() || `Wali ${name.split(' ')[0] || ''}`;
        const parentPhone = parts[7]?.trim() || '081234567890';
        const address = parts[8]?.trim() || 'Gunungkidul, D.I. Yogyakarta';
        const spp = parseInt(parts[9]?.replace(/[^0-9]/g, '') || '250000', 10) || 250000;
        const pengembangan = parseInt(parts[10]?.replace(/[^0-9]/g, '') || '3500000', 10) || 3500000;

        const isValid = name.length > 1 && nisn.length >= 5;
        const errorNote = !name ? 'Nama Siswa kosong' : nisn.length < 5 ? 'NISN tidak valid' : undefined;

        rows.push({
          nisn,
          nis,
          name,
          gender,
          classGrade,
          major,
          parentName,
          parentPhone,
          address,
          monthlySppAmount: spp,
          totalUangPengembangan: pengembangan,
          isValid,
          errorNote
        });
      }
    });

    if (rows.length === 0) {
      setErrorMessage('Tidak ada baris data siswa yang berhasil diurai. Pastikan format kolom sesuai dengan template.');
    } else {
      setParsedRows(rows);
      setActiveStep('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseFileContent(content);
      }
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          parseFileContent(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Submit and save to database
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data siswa yang valid untuk diimpor.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const formattedList: Array<Omit<Student, 'id'>> = validRows.map(r => ({
        nisn: r.nisn,
        nis: r.nis,
        name: r.name,
        gender: r.gender,
        classGrade: r.classGrade,
        major: r.major,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        address: r.address,
        monthlySppAmount: r.monthlySppAmount,
        totalUangPengembangan: r.totalUangPengembangan,
        paidUangPengembangan: 0
      }));

      addBatchStudents(formattedList, autoCreateBills);

      setIsProcessing(false);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
      onClose();
    }, 600);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-md">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Import Berkas Spreadsheet
              </span>
              <h2 className="text-lg font-bold text-white">
                Upload Data Siswa Berdasarkan Template
              </h2>
              <p className="text-xs text-slate-300">
                Unduh template resmi, isi data siswa per kelas/jurusan di Excel, dan unggah kembali untuk impor instan.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Step Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('download')}
            className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeStep === 'download'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Langkah 1: Unduh Format Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('upload')}
            className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeStep === 'upload'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Langkah 2: Unggah &amp; Pratinjau Data ({parsedRows.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[68vh] overflow-y-auto space-y-5">
          
          {/* STEP 1: DOWNLOAD TEMPLATE & GUIDELINES */}
          {activeStep === 'download' && (
            <div className="space-y-4">
              
              {/* Download CTA Box */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    <FileCheck className="w-3.5 h-3.5" />
                    Format Resmi {schoolInfo.shortName}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Unduh Berkas Template Siswa
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                    Berkas telah dilengkapi dengan format kolom, petunjuk pengisian, serta 4 baris data contoh (TKJ, RPL, TBSM, AKL) agar Anda mudah memasukkan ratusan siswa.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => downloadStudentTemplateExcel(schoolInfo.name)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel (.xls)</span>
                  </button>

                  <button
                    onClick={() => downloadStudentTemplateCsv(schoolInfo.name)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Guidelines Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-800">
                    Struktur Kolom &amp; Panduan Pengisian Berkas:
                  </span>
                </div>
                <div className="p-4 space-y-2.5 text-xs text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-emerald-800">1. NISN &amp; NIS:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Wajib diisi. Format angka (contoh: 0081298411, 221081).</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-emerald-800">2. Nama &amp; Jenis Kelamin:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Nama lengkap siswa. Jenis kelamin diisi <strong>L</strong> (Laki-laki) atau <strong>P</strong> (Perempuan).</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-emerald-800">3. Rombel Kelas &amp; Jurusan:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Contoh kelas: <em>X TKJ 1, XI RPL 2</em>. Jurusan: <em>Teknik Komputer &amp; Jaringan, dsb</em>.</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-emerald-800">4. Wali &amp; WhatsApp:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Nomor WhatsApp aktif wali murid (contoh: 081234567890) untuk notifikasi tagihan.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to Upload Prompt */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Sudah selesai mengisi data pada template?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep('upload')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Lanjut ke Unggah Berkas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: UPLOAD & PREVIEW */}
          {activeStep === 'upload' && (
            <div className="space-y-4">
              
              {/* Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">
                    Klik untuk memilih berkas atau seret file ke sini
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung berkas <strong>.csv</strong> atau <strong>.xls / .txt</strong> hasil template resmi
                  </p>
                </div>
                {uploadedFileName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 rounded-full text-xs font-semibold text-emerald-800 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{uploadedFileName}</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".csv, .txt, .xls, .xlsx"
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Preview Table if rows exist */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        Pratinjau Data Terbaca ({parsedRows.length} Siswa):
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {validCount} Siap Impor
                      </span>
                      {invalidCount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {invalidCount} Perlu Perbaikan
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadStudentTemplateCsv(schoolInfo.name)}
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Ulang Template</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] sticky top-0 z-10">
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">NISN / NIS</th>
                          <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                          <th className="py-2.5 px-3">Wali Murid</th>
                          <th className="py-2.5 px-3 text-right">Tarif SPP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                            <td className="py-2.5 px-3">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Valid</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{row.errorNote || 'Error'}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-800">{row.name}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">({row.gender})</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                              {row.nisn} / {row.nis}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-emerald-800">{row.classGrade}</span>
                              <span className="text-[10px] text-slate-500 block">{row.major}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-slate-800">{row.parentName}</span>
                              <span className="text-[10px] text-slate-400 block">{row.parentPhone}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                              {formatRupiah(row.monthlySppAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Auto create bills option */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="batchAutoBills"
                      checked={autoCreateBills}
                      onChange={(e) => setAutoCreateBills(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="batchAutoBills" className="text-xs text-emerald-950 font-medium cursor-pointer">
                      Otomatis terbitkan tagihan SPP bulan berjalan &amp; tagihan Uang Pengembangan Termin 1 untuk seluruh siswa yang diimpor.
                    </label>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            {activeStep === 'upload' && parsedRows.length > 0 ? (
              <button
                type="button"
                disabled={isProcessing || validCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan ke Sistem...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi &amp; Impor {validCount} Siswa</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveStep('upload')}
                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Lanjut Unggah File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
