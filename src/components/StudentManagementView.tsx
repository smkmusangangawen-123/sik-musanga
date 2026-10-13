import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  GraduationCap, 
  BookOpen, 
  Phone, 
  Edit3, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight,
  Building,
  Upload,
  UserCheck,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { formatRupiah } from '../utils/formatters';
import { UploadStudentTemplateModal } from './UploadStudentTemplateModal';
import { downloadStudentTemplateExcel, downloadStudentTemplateCsv } from '../utils/exportDocs';

// Standard vocational school majors (Jurusan)
export const DEFAULT_MAJORS = [
  { code: 'TKJ', name: 'Teknik Komputer & Jaringan', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { code: 'RPL', name: 'Rekayasa Perangkat Lunak', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { code: 'TBSM', name: 'Teknik Bisnis Sepeda Motor', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { code: 'AKL', name: 'Akuntansi & Keuangan Lembaga', color: 'bg-purple-50 text-purple-800 border-purple-200' }
];

export const DEFAULT_CLASSES = [
  'X TKJ 1', 'X TKJ 2', 'XI TKJ 1', 'XI TKJ 2', 'XII TKJ 1',
  'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI RPL 2', 'XII RPL 1',
  'X TBSM 1', 'X TBSM 2', 'XI TBSM 1', 'XI TBSM 2', 'XII TBSM 1',
  'X AKL 1', 'XI AKL 1', 'XII AKL 1'
];

export const StudentManagementView: React.FC = () => {
  const { 
    schoolInfo,
    students, 
    bills, 
    addStudent, 
    addBatchStudents, 
    updateStudent, 
    deleteStudent,
    setCurrentStudentId,
    setActiveRole
  } = useApp();

  // Filter state
  const [selectedMajor, setSelectedMajor] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Single Add / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    nis: '',
    gender: 'L' as 'L' | 'P',
    major: 'Teknik Komputer & Jaringan',
    classGrade: 'X TKJ 1',
    parentName: '',
    parentPhone: '',
    address: '',
    monthlySppAmount: 250000,
    totalUangPengembangan: 3500000,
    autoCreateBills: true
  });

  // Batch Add Form State
  const [batchMajor, setBatchMajor] = useState('Teknik Komputer & Jaringan');
  const [batchClass, setBatchClass] = useState('X TKJ 1');
  const [batchSppAmount, setBatchSppAmount] = useState(250000);
  const [batchPengembanganAmount, setBatchPengembanganAmount] = useState(3500000);
  const [batchRawText, setBatchRawText] = useState(
    '0081298401, 221081, Rizky Febrian, L, Ahmad Febrian, 081298765432\n0081298402, 221082, Nabila Syakira, P, Herman Syakira, 081387654321\n0081298403, 221083, Doni Prasetyo, L, Joko Prasetyo, 081987654320'
  );

  // Available unique majors & classes from data
  const majorsList = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.major)));
    return ['Semua', ...list];
  }, [students]);

  const classesList = useMemo(() => {
    let filtered = students;
    if (selectedMajor !== 'Semua') {
      filtered = students.filter(s => s.major === selectedMajor);
    }
    const list = Array.from(new Set(filtered.map(s => s.classGrade))).sort();
    return ['Semua', ...list];
  }, [students, selectedMajor]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (selectedMajor !== 'Semua' && student.major !== selectedMajor) return false;
      if (selectedClass !== 'Semua' && student.classGrade !== selectedClass) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchNisn = student.nisn.includes(q);
        const matchNis = student.nis.includes(q);
        const matchParent = student.parentName.toLowerCase().includes(q);
        if (!matchName && !matchNisn && !matchNis && !matchParent) return false;
      }
      return true;
    });
  }, [students, selectedMajor, selectedClass, searchQuery]);

  // Reset Single Form
  const resetSingleForm = () => {
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      gender: 'L',
      major: 'Teknik Komputer & Jaringan',
      classGrade: 'X TKJ 1',
      parentName: '',
      parentPhone: '',
      address: '',
      monthlySppAmount: 250000,
      totalUangPengembangan: 3500000,
      autoCreateBills: true
    });
  };

  // Open Edit Form
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nisn: student.nisn,
      nis: student.nis,
      gender: student.gender,
      major: student.major,
      classGrade: student.classGrade,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      monthlySppAmount: student.monthlySppAmount,
      totalUangPengembangan: student.totalUangPengembangan,
      autoCreateBills: false
    });
    setIsAddModalOpen(true);
  };

  // Handle Save Single Student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: formData.name,
        nisn: formData.nisn,
        nis: formData.nis,
        gender: formData.gender,
        major: formData.major,
        classGrade: formData.classGrade,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        monthlySppAmount: Number(formData.monthlySppAmount),
        totalUangPengembangan: Number(formData.totalUangPengembangan)
      });
    } else {
      addStudent({
        name: formData.name,
        nisn: formData.nisn,
        nis: formData.nis,
        gender: formData.gender,
        major: formData.major,
        classGrade: formData.classGrade,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        monthlySppAmount: Number(formData.monthlySppAmount),
        totalUangPengembangan: Number(formData.totalUangPengembangan),
        paidUangPengembangan: 0
      }, formData.autoCreateBills);
    }
    setIsAddModalOpen(false);
    setEditingStudent(null);
    resetSingleForm();
  };

  // Handle Batch Import Form Submit
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchRawText.split('\n').filter(line => line.trim().length > 0);
    const parsedStudents: Array<Omit<Student, 'id'>> = [];

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const nisn = parts[0] || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const nis = parts[1] || `${Math.floor(100000 + Math.random() * 900000)}`;
        const name = parts[2];
        const gender = (parts[3]?.toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P';
        const parentName = parts[4] || `Wali ${name.split(' ')[0]}`;
        const parentPhone = parts[5] || '081234567890';

        parsedStudents.push({
          nisn,
          nis,
          name,
          gender,
          classGrade: batchClass,
          major: batchMajor,
          parentName,
          parentPhone,
          address: 'Gunungkidul, D.I. Yogyakarta',
          monthlySppAmount: Number(batchSppAmount),
          totalUangPengembangan: Number(batchPengembanganAmount),
          paidUangPengembangan: 0
        });
      }
    });

    if (parsedStudents.length > 0) {
      addBatchStudents(parsedStudents, true);
      setIsBatchModalOpen(false);
    } else {
      alert('Format input tidak valid. Pastikan setiap baris berisi minimal: NISN, NIS, Nama');
    }
  };

  // Preview as Student
  const handleImpersonate = (studentId: string) => {
    setCurrentStudentId(studentId);
    setActiveRole('student');
  };

  // Count metrics
  const totalStudents = students.length;
  const majorStats = useMemo(() => {
    const stats: Record<string, number> = {};
    students.forEach(s => {
      stats[s.major] = (stats[s.major] || 0) + 1;
    });
    return stats;
  }, [students]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Manajemen Siswa Per Jurusan &amp; Per Kelas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Data Siswa &amp; Rombel Kelas
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Kelola data peserta didik per kompetensi keahlian dan rombel kelas, atur tarif SPP, komitmen uang sarana prasarana, serta akses wali murid.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Template Dropdown / Quick Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 shadow-xs"
                title="Unduh Format Berkas Excel / CSV Siswa"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Unduh Template</span>
              </button>

              {showTemplateDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs text-slate-800 animate-in fade-in"
                  onMouseLeave={() => setShowTemplateDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    Pilih Format Berkas:
                  </div>
                  <button
                    onClick={() => {
                      downloadStudentTemplateExcel(schoolInfo.name);
                      setShowTemplateDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Format Excel (.xls)</div>
                      <div className="text-[10px] text-slate-500">Direkomendasikan (Tabel &amp; Kop)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      downloadStudentTemplateCsv(schoolInfo.name);
                      setShowTemplateDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors font-medium border-t border-slate-100"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-bold">Format CSV (.csv)</div>
                      <div className="text-[10px] text-slate-500">Kompatibel semua spreadsheet</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Template Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-200 hover:text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-emerald-400/30 shadow-xs"
              title="Unggah berkas template siswa yang telah diisi"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>Upload Data Template</span>
            </button>

            <button
              onClick={() => {
                setEditingStudent(null);
                resetSingleForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Siswa Baru</span>
            </button>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
            >
              <Layers className="w-4 h-4 text-emerald-300" />
              <span>Input Teks Cepat</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK TEMPLATE HELPER BANNER (UNDUH TEMPLATE & UPLOAD SISWA) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                Fitur Import Data Siswa
              </span>
              <span className="text-xs text-slate-500 font-medium">Template Excel &amp; CSV Tersedia</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
              Unduh Template Resmi &amp; Unggah Data Siswa Sekaligus
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
              Unduh file template (.xls atau .csv), lengkapi data siswa per rombel kelas &amp; jurusan, lalu klik tombol <strong>Upload Data Template</strong> untuk memasukkan ratusan siswa secara otomatis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => downloadStudentTemplateExcel(schoolInfo.name)}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            title="Download Template Format Excel (.xls)"
          >
            <Download className="w-4 h-4" />
            <span>Download Template (.xls)</span>
          </button>

          <button
            onClick={() => downloadStudentTemplateCsv(schoolInfo.name)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-1.5"
            title="Download Template Format CSV (.csv)"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download CSV (.csv)</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload Berkas Sekarang</span>
          </button>
        </div>
      </div>

      {/* Major Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DEFAULT_MAJORS.map(m => {
          const count = majorStats[m.name] || 0;
          return (
            <div 
              key={m.code}
              onClick={() => setSelectedMajor(selectedMajor === m.name ? 'Semua' : m.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedMajor === m.name 
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800">{m.code}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {count} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 truncate" title={m.name}>
                {m.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Filter Data Siswa:
          </span>
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan: <strong className="text-emerald-700">{filteredStudents.length}</strong> dari {totalStudents} Siswa
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Cari Siswa / NISN / Wali
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama, NISN, NIS..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Major Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pilih Jurusan
            </label>
            <select
              value={selectedMajor}
              onChange={(e) => {
                setSelectedMajor(e.target.value);
                setSelectedClass('Semua');
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
            >
              {majorsList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pilih Rombel Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
            >
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa &amp; JK</th>
                <th className="py-3 px-4">NISN / NIS</th>
                <th className="py-3 px-4">Rombel Kelas</th>
                <th className="py-3 px-4">Kompetensi Keahlian (Jurusan)</th>
                <th className="py-3 px-4">Wali Murid &amp; Kontak</th>
                <th className="py-3 px-4 text-right">Tarif SPP</th>
                <th className="py-3 px-4 text-right">Uang Gedung/Sarpras</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const studentBills = bills.filter(b => b.studentId === st.id);
                  const unpaidCount = studentBills.filter(b => b.status !== 'lunas').length;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-medium text-center">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{st.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            st.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {st.gender}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{st.address}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-slate-800">{st.nisn}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {st.nis}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {st.classGrade}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{st.major}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{st.parentName}</div>
                        <a 
                          href={`https://wa.me/${st.parentPhone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{st.parentPhone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(st.monthlySppAmount)}
                        <span className="text-[10px] text-slate-400 block font-normal">/bulan</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-800">{formatRupiah(st.totalUangPengembangan)}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Terbayar: {formatRupiah(st.paidUangPengembangan)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Impersonate / view as student */}
                          <button
                            onClick={() => handleImpersonate(st.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Buka Portal Pembayaran Siswa Ini"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit student */}
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete student */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus data siswa ${st.name} beserta seluruh tagihannya?`)) {
                                deleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Hapus Data Siswa"
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

      {/* MODAL 1: ADD / EDIT SINGLE STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-md">
                  <UserPlus className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    Buku Induk Siswa
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru Per Kelas & Jurusan'}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Jurusan & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kompetensi Keahlian (Jurusan) *
                  </label>
                  <select
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  >
                    {DEFAULT_MAJORS.map(m => (
                      <option key={m.code} value={m.name}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rombongan Belajar (Kelas) *
                  </label>
                  <input
                    type="text"
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    placeholder="Contoh: X TKJ 1, XI RPL 2"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Nama & JK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Fadhil Rahman Hakim"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* NISN & NIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NISN (Nomor Induk Siswa Nasional) *
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="10 digit nomor NISN"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIS Sekolah *
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Contoh: 221085"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Wali & Kontak WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Orang Tua / Wali *
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp Wali (Pengingat Tagihan) *
                  </label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Domisili
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Desa Jurangjero, Kec. Ngawen, Gunungkidul"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Finansial: SPP & Uang Pengembangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Besaran SPP Bulanan (IDR) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.monthlySppAmount}
                    onChange={(e) => setFormData({ ...formData, monthlySppAmount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{formatRupiah(formData.monthlySppAmount)} / bulan</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Komitmen Uang Gedung/Sarpras (IDR) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={formData.totalUangPengembangan}
                    onChange={(e) => setFormData({ ...formData, totalUangPengembangan: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{formatRupiah(formData.totalUangPengembangan)}</span>
                </div>
              </div>

              {/* Auto Create Bills checkbox (for new student only) */}
              {!editingStudent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoBills"
                    checked={formData.autoCreateBills}
                    onChange={(e) => setFormData({ ...formData, autoCreateBills: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="autoBills" className="text-xs text-emerald-900 font-medium cursor-pointer">
                    Otomatis terbitkan tagihan SPP bulan berjalan &amp; tagihan Uang Pengembangan Termin 1 untuk siswa ini.
                  </label>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: BATCH / BULK ADD STUDENTS PER CLASS */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-md">
                  <Layers className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    Pendaftaran Rombongan Belajar
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    Tambah / Import Siswa Massal per Kelas &amp; Jurusan
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setIsBatchModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBatchSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Target Class & Major */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sasaran Jurusan
                  </label>
                  <select
                    value={batchMajor}
                    onChange={(e) => setBatchMajor(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    {DEFAULT_MAJORS.map(m => (
                      <option key={m.code} value={m.name}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sasaran Rombel Kelas
                  </label>
                  <input
                    type="text"
                    value={batchClass}
                    onChange={(e) => setBatchClass(e.target.value)}
                    placeholder="Contoh: X TKJ 2"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Tarif SPP & Sarpras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tarif SPP Bulanan (IDR)
                  </label>
                  <input
                    type="number"
                    value={batchSppAmount}
                    onChange={(e) => setBatchSppAmount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tarif Uang Pengembangan (IDR)
                  </label>
                  <input
                    type="number"
                    value={batchPengembanganAmount}
                    onChange={(e) => setBatchPengembanganAmount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              {/* Batch Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Data Siswa (1 Baris = 1 Siswa):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Format: NISN, NIS, Nama Siswa, JK (L/P), Nama Wali, No WA
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={batchRawText}
                  onChange={(e) => setBatchRawText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0081298401, 221081, Nama Siswa, L, Nama Wali, 081234567890"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                💡 Anda dapat menyalin langsung kolom dari spreadsheet Excel lalu mengganti tab/koma untuk input puluhan siswa sekaligus dalam hitungan detik.
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>Proses Import Siswa Massal</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Upload Student Template Modal */}
      <UploadStudentTemplateModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

    </div>
  );
};
