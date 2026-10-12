import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
