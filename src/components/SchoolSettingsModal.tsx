import React, { useState } from 'react';
import { 
  X, 
  School, 
  Upload, 
  Save, 
  Image as ImageIcon, 
  Building, 
  UserCheck, 
  CreditCard, 
  Phone, 
  Mail, 
  Globe, 
  Check, 
  RotateCcw,
  Sparkles,
  Database,
  Download,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SchoolInfo } from '../types';
import { defaultSchoolInfo } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Preset logos with beautiful high-res SVGs
const PRESET_LOGOS = [
  {
    id: 'muhammadiyah',
    name: 'SMK Muhammadiyah (Surya Hijau)',
    badgeText: 'SMK MUS',
    badgeSub: '1 NGW',
    color: 'from-emerald-700 to-green-900',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#047857" stroke="#fbbf24" stroke-width="4"/>
      <path d="M50 12 L53 32 L70 20 L58 37 L78 35 L61 46 L82 50 L61 54 L78 65 L58 63 L70 80 L53 68 L50 88 L47 68 L30 80 L42 63 L22 65 L39 54 L18 50 L39 46 L22 35 L42 37 L30 20 L47 32 Z" fill="#fbbf24"/>
      <circle cx="50" cy="50" r="18" fill="#ffffff" stroke="#047857" stroke-width="2"/>
      <circle cx="50" cy="50" r="14" fill="#047857"/>
      <path d="M46 44 Q50 40 54 44 Q50 48 46 44 Z" fill="#ffffff"/>
      <text x="50" y="54" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">SMK</text>
    </svg>`
  },
  {
    id: 'tutwuri',
    name: 'Tut Wuri Handayani / Kemendikbud',
    badgeText: 'SMK',
    badgeSub: 'KEMENDIKBUD',
    color: 'from-blue-700 to-indigo-950',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1d4ed8" stroke="#fbbf24" stroke-width="4"/>
      <path d="M50 16 L60 38 L84 38 L65 52 L72 75 L50 61 L28 75 L35 52 L16 38 L40 38 Z" fill="#fbbf24"/>
      <circle cx="50" cy="16" r="16" fill="#ffffff"/>
      <path d="M42 55 C42 45, 58 45, 58 55 Z" fill="#1d4ed8"/>
      <circle cx="50" cy="44" r="4" fill="#1d4ed8"/>
    </svg>`
  },
  {
    id: 'teknologi',
    name: 'Vokasi Kejuruan Modern',
    badgeText: 'VOCATIONAL',
    badgeSub: 'TEKNOLOGI',
    color: 'from-teal-700 to-slate-900',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0f766e" stroke="#5eead4" stroke-width="3"/>
      <circle cx="50" cy="50" r="32" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M32 62 L50 30 L68 62 L50 54 Z" fill="#ffffff"/>
      <circle cx="50" cy="48" r="6" fill="#0f766e"/>
    </svg>`
  }
];

export const SchoolSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    schoolInfo, 
    updateSchoolInfo,
    students,
    bills,
    transactions,
    users,
    studentAccounts,
    exportDatabaseBackup,
    importDatabaseBackup
  } = useApp();
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [activeTab, setActiveTab] = useState<'profile' | 'logo' | 'rekening' | 'system'>('profile');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('muhammadiyah');
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: keyof SchoolInfo['bankAccount'], value: string) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: { ...prev.bankAccount, [field]: value }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('logoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_LOGOS[0]) => {
    setSelectedPresetId(preset.id);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
    handleChange('logoUrl', svgDataUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(formData);
    onClose();
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan identitas sekolah ke SMK Muhammadiyah 1 Ngawen default?')) {
      setFormData({ ...defaultSchoolInfo });
      updateSchoolInfo({ ...defaultSchoolInfo });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-md">
              <School className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Pengaturan Lembaga
              </span>
              <h2 className="text-lg font-bold text-white">Edit Identitas &amp; Logo Sekolah</h2>
              <p className="text-xs text-slate-300">
                Data ini akan tercetak otomatis pada Kwitansi Resmi, Laporan PDF/Docx/Excel, dan Kop Surat.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Profil &amp; Kontak Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo &amp; Lambang Resmi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rekening')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'rekening'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pejabat &amp; Rekening Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Mode Mandiri (Bebas API Key)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold uppercase">
              100% Offline
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            
            {/* Tab 1: Profile & Contact */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Contoh: SMK Muhammadiyah 1 Ngawen"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nama Singkatan
                    </label>
                    <input
                      type="text"
                      value={formData.shortName}
                      onChange={(e) => handleChange('shortName', e.target.value)}
                      placeholder="SMK Musanga"
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      NPSN Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.npsn}
                      onChange={(e) => handleChange('npsn', e.target.value)}
                      placeholder="20402115"
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Status Akreditasi
                    </label>
                    <input
                      type="text"
                      value={formData.akreditasi}
                      onChange={(e) => handleChange('akreditasi', e.target.value)}
                      placeholder="A (Unggul)"
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Alamat Lengkap Sekolah (Untuk Kop Surat)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Jl. Raya Ngawen - Cawas Km. 1, Gunungkidul, D.I. Yogyakarta 55853"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telepon / WA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="0812-2890-4411"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Resmi
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="smkmusangangawen@gmail.com"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="smkmuh1ngawen.sch.id"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Logo & Lambang */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                {/* Live Logo Preview Box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-300 shadow-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    {formData.logoUrl ? (
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Sekolah" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center text-center font-black">
                        <span className="text-[10px]">SMK</span>
                        <span className="text-sm font-extrabold leading-none">MUS</span>
                        <span className="text-[8px] text-emerald-200">1 NGW</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Preview Kop Surat</span>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase">{formData.name}</h4>
                    <p className="text-xs text-slate-500">NPSN: {formData.npsn} • Akreditasi: {formData.akreditasi}</p>
                    <p className="text-[11px] text-slate-500">{formData.address}</p>
                  </div>
                </div>

                {/* Preset Logos Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Pilihan Logo Preset Resmi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PRESET_LOGOS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          selectedPresetId === preset.id
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-xs flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: preset.svg }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 truncate">{preset.name}</div>
                          <span className="text-[10px] text-slate-400">Pilih Preset Ini</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Upload or URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Upload File Logo Baru (PNG/JPG/SVG)
                    </label>
                    <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Pilih berkas logo</span>
                      <span className="text-[10px] text-slate-400">Max 2MB (transparan lebih rapi)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Atau Tautan URL Logo
                    </label>
                    <input
                      type="url"
                      value={formData.logoUrl || ''}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo-sekolah.png"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Masukkan URL link gambar logo sekolah yang sudah dihosting secara online.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Pejabat & Rekening */}
            {activeTab === 'rekening' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nama Kepala Sekolah &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={formData.headmaster}
                      onChange={(e) => handleChange('headmaster', e.target.value)}
                      placeholder="Drs. H. Ahmad Sudarsono, M.Pd."
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nama Bendahara Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.treasurerName}
                      onChange={(e) => handleChange('treasurerName', e.target.value)}
                      placeholder="Siti Rahmawati, S.E."
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIP / NBM Bendahara Sekolah (Untuk Kwitansi Resmi)
                  </label>
                  <input
                    type="text"
                    value={formData.treasurerNip}
                    onChange={(e) => handleChange('treasurerNip', e.target.value)}
                    placeholder="19840512 201001 2 018"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Rekening Kas Resmi Sekolah (Transfer Manual/VA)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Bank Penampung
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount.bank}
                        onChange={(e) => handleBankChange('bank', e.target.value)}
                        placeholder="Bank BPD DIY Syariah"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Nomor Rekening
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount.accountNumber}
                        onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                        placeholder="102.21.00034.1"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Atas Nama Rekening
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount.accountHolder}
                        onChange={(e) => handleBankChange('accountHolder', e.target.value)}
                        placeholder="SMK Muhammadiyah 1 Ngawen"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Standalone / Zero API Key & Database Backup */}
            {activeTab === 'system' && (
              <div className="space-y-4">
                {/* System Mode Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          Sistem EduPay Mode Mandiri (Bebas API Key)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Aktif • 100% Standalone
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Aplikasi ini beroperasi <strong>tanpa memerlukan API Key apa pun</strong>, tanpa biaya kuota token, dan tanpa ketergantungan server cloud eksternal. Semua data operasional tersimpan secara aman dan persisten di browser komputer sekolah.
                      </p>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-200/70 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>0 Biaya Langganan:</strong> Bebas kuota &amp; biaya bulanan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Penyimpanan Mandiri:</strong> LocalStorage + Cadangan JSON</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Simulasi QRIS &amp; VA:</strong> Generator lokal langsung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>WhatsApp Direct:</strong> Integrasi resmi wa.me (Tanpa Bot API)</span>
                    </div>
                  </div>
                </div>

                {/* Database Statistics */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      Ringkasan Data Tersimpan Saat Ini
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Penyimpanan Browser Lokal</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-base font-extrabold text-slate-800">{students.length}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Data Siswa</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-base font-extrabold text-slate-800">{bills.length}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Tagihan SPP</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-base font-extrabold text-emerald-700">{transactions.length}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Transaksi</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-base font-extrabold text-indigo-700">{users.length}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Akun Staf</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-base font-extrabold text-emerald-700">{studentAccounts.length}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Akun Siswa</div>
                    </div>
                  </div>
                </div>

                {/* Backup & Restore Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Backup Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">Cadangkan Basis Data (.JSON)</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Unduh salinan lengkap seluruh siswa, tagihan, transaksi, akun pengguna, dan pengaturan dalam satu file cadangan aman.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={exportDatabaseBackup}
                      className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File Cadangan JSON</span>
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">Pulihkan Basis Data (.JSON)</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Gunakan file cadangan sebelumnya untuk memulihkan seluruh data saat berpindah laptop atau mengganti perangkat kerja bendahara.
                      </p>
                    </div>
                    
                    <label className="mt-3 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
                      <FileJson className="w-3.5 h-3.5" />
                      <span>Pilih File Cadangan JSON</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            if (content) {
                              const res = importDatabaseBackup(content);
                              if (res.success) {
                                setRestoreStatus({ type: 'success', text: res.message });
                              } else {
                                setRestoreStatus({ type: 'error', text: res.message });
                              }
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {restoreStatus && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    restoreStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {restoreStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{restoreStatus.text}</span>
                  </div>
                )}

                {/* Practical Advice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Tips Pemakaian Tanpa API Key:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-amber-800">
                      <li>Secara berkala unduh <em>File Cadangan JSON</em> (misal tiap akhir bulan) untuk disimpan di flashdisk atau Google Drive bendahara.</li>
                      <li>Kwitansi dan kartu login siswa dapat langsung dicetak atau disimpan sebagai file PDF tanpa kuota internet.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Identitas</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
