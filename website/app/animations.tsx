"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function GlitchText({
  text,
  as: Tag = "span",
  className = "",
  glitchInterval = 4000,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "div" | "p";
  className?: string;
  glitchInterval?: number;
}) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const glitch = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 120);
    };
    const id = setInterval(glitch, glitchInterval);
    return () => clearInterval(id);
  }, [glitchInterval]);

  return (
    <Tag
      className={`glitch-text ${glitching ? "glitching" : ""} ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.35,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  const dirVariants: Record<string, { x?: number; y?: number }> = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...dirVariants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

function useTypewriter(lines: string[], charDelay: number, lineDelay: number) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let currentLine = 0;
    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (currentLine >= lines.length) {
        setTyping(false);
        return;
      }

      const line = lines[currentLine];
      if (charIndex === 0) {
        setVisibleLines((prev) => [...prev, ""]);
      }

      if (charIndex < line.length) {
        charIndex++;
        setVisibleLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, charIndex);
          return next;
        });
        timer = setTimeout(typeChar, charDelay);
      } else {
        charIndex = 0;
        currentLine++;
        timer = setTimeout(typeChar, lineDelay);
      }
    };

    timer = setTimeout(typeChar, 300);
    return () => clearTimeout(timer);
  }, [lines, charDelay, lineDelay]);

  return { visibleLines, typing };
}

export function LoadingScreen({ done }: { done: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bootMessages = [
    "SYS::INIT — loading kernel modules...",
    "SYS::NET — establishing secure channel...",
    "SYS::CRYPTO — decrypting session key...",
    "SYS::UI — compiling interface layers...",
    "SYS::DONE — system ready. Access granted.",
  ];

  const { visibleLines, typing } = useTypewriter(bootMessages, 28, 350);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(230, 57, 70, 0.08)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    let frame: number;
    const loop = () => { draw(); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`loading-screen ${done ? "loading-fade-out" : ""}`}>
      <div className="loading-screen-bg" />
      <canvas ref={canvasRef} className="loading-matrix" aria-hidden="true" />
      <div className="loading-content">
        <div className="loading-logo" data-text="ZEPHTRIX STUDIO">ZEPHTRIX STUDIO</div>
        <div className="loading-terminal">
          {visibleLines.map((line, i) => (
            <p key={i} className="loading-line">{line}<span className="loading-cursor-inline" /></p>
          ))}
          {typing && visibleLines.length > 0 && <span className="loading-cursor" />}
        </div>
      </div>
    </div>
  );
}

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const [hide, setHide] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      setContentReady(true);
    }, 4200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setHide(true), 600);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <>
      {!hide && <LoadingScreen done={done} />}
      <div style={{
        opacity: contentReady ? 1 : 0,
        transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        {children}
      </div>
    </>
  );
}

export function MatrixRain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(230, 57, 70, 0.08)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`matrix-rain ${className}`}
      aria-hidden="true"
    />
  );
}
