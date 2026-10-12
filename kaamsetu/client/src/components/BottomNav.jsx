import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ role, activeTab, onSelectTab, tabs }) {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-10px_35px_0_rgba(0,0,0,0.06)] max-w-md mx-auto w-full transition-all">
      <div className="flex items-stretch justify-around px-1 py-1">
        {tabs.map(([key, icon, labelKey]) => {
          const isActive = activeTab === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectTab(key)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all relative select-none rounded-2xl cursor-pointer ${
                isActive
                  ? 'text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-700 font-semibold'
              }`}
            >
              {/* Active animated top pill indicator in Safety Yellow with layoutId */}
              {isActive && (
                <motion.span
                  layoutId="bottomNavActivePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute top-0 inset-x-3 h-1 bg-yellow-400 rounded-full shadow-[0_2px_8px_rgba(255,194,46,0.6)]"
                />
              )}
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`text-2xl mb-0.5 ${isActive ? 'opacity-100' : 'opacity-70'}`}
              >
                {icon}
              </motion.span>
              <span className={`text-[11px] leading-tight truncate max-w-[76px] ${isActive ? 'font-black text-slate-950' : 'font-medium'}`}>
                {t(labelKey) || labelKey}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
