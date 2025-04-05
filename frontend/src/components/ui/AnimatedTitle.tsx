"use client";
import { motion } from "framer-motion";

type AnimatedTitleProps = {
  text: string;
};

const AnimatedTitle = ({ text }: AnimatedTitleProps) => {
  const letters = text.split("");

  return (
    <motion.h1
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="font-bold text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-xs text-[#294BB6]"
      style={{ textShadow: "2px 2px 4px rgba(169, 169, 169, 1)" }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease: "easeOut" }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default AnimatedTitle;
