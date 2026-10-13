import React from 'react';
import { X, Bell, CheckCheck, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateIndo } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, activeRole, currentStudentId } = useApp();

  if (!isOpen) return null;

  // Filter for student if in student role
  const relevantNotifications = notifications.filter(n => {
    if (activeRole === 'student') {
      return !n.studentId || n.studentId === currentStudentId;
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'warning':
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const requestBrowserPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('EduPay SMK', {
            body: 'Notifikasi push berhasil diaktifkan di browser Anda!',
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Notifikasi Tagihan &amp; Saldo</h3>
              <p className="text-[11px] text-slate-500">Pembaruan real-time transaksi keuangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={markAllNotificationsAsRead}
            className="text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tandai Semua Sudah Dibaca</span>
          </button>

          {'Notification' in window && Notification.permission !== 'granted' && (
            <button
              onClick={requestBrowserPush}
              className="text-emerald-700 hover:underline font-medium text-[11px]"
            >
              Izinkan Notif Browser
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {relevantNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Tidak ada notifikasi baru saat ini.
            </div>
          ) : (
            relevantNotifications.map(item => {
              const isUrgent = item.type === 'urgent';
              return (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isUrgent && !item.read
                      ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                      : item.read
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-emerald-50/50 border-emerald-200 text-slate-800 ring-1 ring-emerald-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getIcon(item.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isUrgent ? 'text-rose-900' : item.read ? 'text-slate-800' : 'text-emerald-950'}`}>
                            {item.title}
                          </span>
                          {isUrgent && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
                              Darurat
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDateIndo(item.createdAt, true)}
                        </span>
                      </div>
                      <p className={`mt-1 leading-relaxed text-[11px] ${isUrgent ? 'text-rose-800 font-medium' : 'text-slate-600'}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
