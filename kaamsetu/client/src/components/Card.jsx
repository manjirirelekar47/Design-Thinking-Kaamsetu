import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  highlight = false,
  onClick,
  animate = true,
  noPadding = false,
}) {
  const Component = animate ? motion.section : 'section';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
        whileHover: onClick ? { y: -2, transition: { duration: 0.15 } } : undefined,
      }
    : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`bg-white rounded-3xl transition-all border ${
        highlight
          ? 'border-yellow-400 ring-4 ring-yellow-400/20 shadow-[0_8px_30px_rgb(255,194,46,0.22)]'
          : 'border-slate-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.07)]'
      } ${noPadding ? '' : 'p-5 sm:p-6'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
