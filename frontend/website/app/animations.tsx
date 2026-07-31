"use client";

import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const MotionLink = motion.create(Link);

export function MagneticLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink href={href} className={className} style={{ x: springX, y: springY }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </MotionLink>
  );
}

export function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/\d+/);
  const numeric = match ? parseInt(match[0], 10) : null;

  useEffect(() => {
    if (!isInView || numeric == null || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, numeric, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => { node.textContent = value.replace(/\d+/, String(Math.round(v))); },
    });
    return () => controls.stop();
  }, [isInView, numeric, value]);

  return <span ref={ref} className={className}>{numeric == null ? value : "0"}</span>;
}

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
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  if (href) {
    return (
      <MotionLink href={href} className={className} variants={variants} style={{ willChange: "transform, opacity" }}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

export function LoadingScreen({ visible }: { visible: boolean }) {
  const [bootLines, setBootLines] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const bootMessages = [
    "SYS::INIT — loading kernel modules...",
    "SYS::NET — establishing secure channel...",
    "SYS::CRYPTO — decrypting session key...",
    "SYS::UI — compiling interface layers...",
    "SYS::DONE — system ready. Access granted.",
  ];

  useEffect(() => {
    if (!visible) return;
    setBootLines([]);
    let index = 0;
    timerRef.current = setInterval(() => {
      if (index < bootMessages.length) {
        setBootLines((prev) => [...prev, bootMessages[index]]);
        index++;
      } else {
        clearInterval(timerRef.current);
      }
    }, 250);
    return () => clearInterval(timerRef.current);
  }, [visible]);

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
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(251, 191, 36, 0.14)";
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

  if (!visible) return null;

  return (
    <div className="loading-screen">
      <canvas ref={canvasRef} className="loading-matrix" aria-hidden="true" />
      <div className="loading-content">
        <div className="loading-logo" data-text="MIRZA IT SOLUTION">MIRZA IT SOLUTION</div>
        <div className="loading-terminal">
          {bootLines.map((line, i) => (
            <p key={i} className="loading-line" style={{ animationDelay: `${i * 0.1}s` }}>{line}</p>
          ))}
          {bootLines.length < bootMessages.length && <span className="loading-cursor" />}
        </div>
      </div>
    </div>
  );
}

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <>
      <LoadingScreen visible={visible} />
      <div style={{
        opacity: visible ? 0 : 1,
        transition: "opacity 0.5s ease",
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
      ctx.fillStyle = "rgba(251, 191, 36, 0.1)";
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
