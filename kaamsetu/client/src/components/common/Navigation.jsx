import { useLanguage } from '../../context/LanguageContext';

export default function Navigation({ role, activeTab, onSelectTab, tabs }) {
  const { t } = useLanguage();

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-slate-200/90 shadow-xl max-w-lg mx-auto w-full">
      <div className="flex items-stretch justify-around">
        {tabs.map(([key, icon, labelKey]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onSelectTab(key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 transition-all relative ${
                isActive
                  ? 'text-navy-950 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              {/* Active top indicator pill in Safety Yellow */}
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-1 bg-safety rounded-full shadow-sm" />
              )}
              <span className={`text-2xl mb-0.5 transition-transform ${isActive ? 'scale-110' : 'scale-100 opacity-80'}`}>
                {icon}
              </span>
              <span className="text-[11px] sm:text-xs leading-none truncate max-w-[80px]">
                {role === 'worker' ? t(labelKey) : labelKey}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
