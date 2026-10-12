export default function Card({ children, className = '', highlight = false }) {
  return (
    <section
      className={`bg-white rounded-2xl border ${
        highlight
          ? 'border-safety-500 shadow-yellow ring-2 ring-safety-200'
          : 'border-slate-200/90 shadow-card hover:shadow-soft'
      } p-4 sm:p-5 transition-all ${className}`}
    >
      {children}
    </section>
  );
}
