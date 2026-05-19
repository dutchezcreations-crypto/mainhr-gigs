import { 
  MessageSquare, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  Bell,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivityItemProps {
  notification: any;
}

export default function ActivityItem({ notification }: ActivityItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={18} />;
      case 'order': return <Zap size={18} />;
      case 'payment': return <DollarSign size={18} />;
      case 'verification': return <ShieldCheck size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'message': return { bg: "var(--color-primary-50)", icon: "var(--color-primary-600)" };
      case 'order': return { bg: "var(--color-accent-50)", icon: "var(--color-accent-600)" };
      case 'payment': return { bg: "var(--color-success-50)", icon: "var(--color-success-600)" };
      case 'verification': return { bg: "var(--color-primary-50)", icon: "var(--color-primary-600)" };
      default: return { bg: "var(--color-neutral-50)", icon: "var(--color-neutral-600)" };
    }
  };

  const colors = getColors(notification.type);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4 p-4 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer group"
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" 
        style={{ background: colors.bg, color: colors.icon }}
      >
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-850 text-neutral-900 text-sm mb-1">{notification.title}</h4>
        <p className="text-xs font-medium text-neutral-500 line-clamp-2 leading-relaxed mb-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
           <Clock size={10} /> {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
