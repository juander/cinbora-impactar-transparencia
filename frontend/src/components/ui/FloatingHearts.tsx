import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import miniImpactar from "../../assets/coracao_azul_transparente.png";
import Image from "next/image";

type HeartProps = {
  id: string;
  startX: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  phase: number;
  amplitude: number;
};

const generateHeart = (): HeartProps => ({
  id: Math.random().toString(36).substr(2, 9),
  startX: Math.random() * 100,
  size: Math.random() * 15 + 10,
  duration: Math.random() * 6 + 8,
  delay: Math.random() * 1,
  opacity: Math.random() * 0.3 + 0.4,
  phase: Math.random() * Math.PI * 2,
  amplitude: Math.random() * 5 + 2,
});

const Heart = ({
  heart,
  onComplete,
}: {
  heart: HeartProps;
  onComplete: (id: string) => void;
}) => {
  const y = useMotionValue(`-10vh`);

  const x = useTransform(y, (latest) => {
    const baseY = parseFloat(latest.toString().replace("vh", ""));
    const offset = Math.sin((baseY + heart.phase) / 10) * heart.amplitude;
    return `${heart.startX + offset}vw`;
  });

  const rotate = useTransform(y, (latest) => {
    const baseY = parseFloat(latest.toString().replace("vh", ""));
    return `${Math.sin(baseY / 10) * 10}deg`;
  });

  const controls = useAnimation();

  useEffect(() => {
    controls
      .start({
        y: "110vh",
        transition: {
          duration: heart.duration,
          ease: "linear",
          delay: heart.delay,
        },
      })
      .then(() => {
        onComplete(heart.id);
      });
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        x,
        y,
        rotate,
        opacity: heart.opacity,
        width: `${heart.size}px`,
        height: `${heart.size}px`,
      }}
      animate={controls}
    >
      <Image
        src={miniImpactar}
        alt="coração"
        width={heart.size}
        height={heart.size}
        style={{
          pointerEvents: "none",
          filter:
            "grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(600%) brightness(90%)",
        }}
      />
    </motion.div>
  );
};

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartProps[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [...prev, generateHeart()]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = (id: string) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map((heart) => (
        <Heart key={heart.id} heart={heart} onComplete={handleComplete} />
      ))}
    </div>
  );
}
