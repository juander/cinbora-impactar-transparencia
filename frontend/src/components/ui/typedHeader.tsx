"use client";
import { useEffect, useState } from "react";

export default function TypedHeader() {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const phrases = [
    "Transparência gera confiança",
    "Acompanhe cada passo das nossas atuações",
    "Transparência gera confiança,\nacompanhe cada passo das nossas atuações."
  ];

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const currentChar = currentPhrase.substring(0, charIndex);

    const delay = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      setDisplayedText(currentChar);

      if (!isDeleting && charIndex < currentPhrase.length) {
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex((prev) => prev - 1);
      } else {
        if (!isDeleting) {
          setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <h2 className="font-semibold text-3xl mt-56 max-w-96 min-h-32 whitespace-pre-wrap text-[#294BB6] max-lg:text-2xl max-md:text-xl max-sm:text-sm max-md:mt-16">
      {displayedText}
      <span className="inline-block w-[1px] bg-[#294BB6] animate-blink ml-[2px] h-[1.5em] align-middle"></span>
    </h2>
  );
}
