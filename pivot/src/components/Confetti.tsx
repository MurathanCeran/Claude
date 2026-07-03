'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF'];

type Particle = {
  id: string;
  x: number;
  rotate: number;
  color: string;
  delay: number;
  size: number;
  duration: number;
};

function buildParticles(count: number, seed: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${seed}-${i}`,
    x: (Math.random() - 0.5) * 340,
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.15,
    size: 6 + Math.random() * 6,
    duration: 0.9 + Math.random() * 0.6,
  }));
}

/**
 * Kutlama konfetisi. `trigger` her değiştiğinde (0 dışında) yeni bir patlama
 * oynatır — dış paket gerekmeden framer-motion parçacıklarıyla üretilir.
 */
export function Confetti({ trigger }: { trigger: number }) {
  const particles = useMemo(() => buildParticles(28, trigger), [trigger]);
  if (!trigger) return null;

  return (
    <div key={trigger} className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, y: -20, x: p.x, rotate: 0 }}
          animate={{ opacity: 0, y: 420, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
