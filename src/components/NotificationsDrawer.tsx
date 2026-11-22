import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCheck,
  CloudRain,
  ShoppingBag,
  Sprout,
  TrendingUp,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { NotificationItem } from '../types/kisansetu';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ open, onClose }) => {
  const { state, t, markNotificationRead, markAllNotificationsRead } = useKisanSetu();
  const navigate = useNavigate();

  if (!open) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'scan':
        return <Camera className="w-4 h-4 text-[#216B43]" />;
      case 'disease':
        return <AlertTriangle className="w-4 h-4 text-[#B8860B]" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-[#2563EB]" />;
      case 'market':
        return <TrendingUp className="w-4 h-4 text-[#216B43]" />;
      case 'buyer':
        return <ShoppingBag className="w-4 h-4 text-[#143A28]" />;
      default:
        return <Sprout className="w-4 h-4 text-[#216B43]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        aria-label={t('notifications.title')}
        className="relative z-10 w-full max-w-md bg-[#F8F7F4] h-full border-l border-[#DEDAD0] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#E5E2DA]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#143A28]" />
            <h2 className="font-display text-lg font-semibold text-[#17231B]">{t('notifications.title')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#216B43] hover:underline px-2 py-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t('notifications.markAllRead')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-2 rounded-lg text-[#546358] hover:bg-[#ECEAE3] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E2DA]">
          {state.notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5E6D63]">
              {t('notifications.empty')}
            </div>
          ) : (
            state.notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  markNotificationRead(item.id);
                  navigate(item.actionRoute);
                  onClose();
                }}
                className={`w-full text-left px-5 py-4 flex items-start gap-3.5 transition-colors hover:bg-white cursor-pointer ${
                  item.read ? 'bg-[#F8F7F4]' : 'bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-[#ECEAE3] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm leading-snug ${item.read ? 'font-medium text-[#3D4E42]' : 'font-semibold text-[#17231B]'}`}>
                      {item.title}
                    </p>
                  </div>
                  <p className="text-xs text-[#546358] mt-1 leading-relaxed">{item.body}</p>
                  <p className="text-[11px] font-mono text-[#6A786E] mt-1.5">
                    {item.timestamp} {!item.read ? `· ${t('enums.statuses.New')}` : ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
