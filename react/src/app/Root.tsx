import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Sun, Moon } from "lucide-react";

// ─── Theme context ─────────────────────────────────────────────────────────────

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

// ─── Particle canvas ──────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
}

function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      size: Math.random() * 1.6 + 0.5,
      hue: i % 3 === 0 ? 1 : 0,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;
      const cyan = isDark ? "0,212,255" : "0,130,180";
      const purple = isDark ? "168,85,247" : "120,58,200";

      ps.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const col = p.hue === 1 ? purple : cyan;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${isDark ? 0.65 : 0.4})`;
        ctx.fill();

        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[j].x - p.x;
          const dy = ps[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 135) {
            const alpha = (1 - dist / 135) * (isDark ? 0.22 : 0.1);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(${i % 4 === 0 ? purple : cyan},${alpha})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const location = useLocation();
  const onLogin = location.pathname === "/login";
  const onRegister = location.pathname === "/register";
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 lg:px-12"
      style={{
        background: isDark ? "rgba(3,11,26,0.72)" : "rgba(237,242,255,0.78)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderBottom: isDark
          ? "1px solid rgba(0,212,255,0.13)"
          : "1px solid rgba(0,100,200,0.13)",
        boxShadow: isDark
          ? "0 4px 40px rgba(0,212,255,0.04)"
          : "0 4px 40px rgba(0,80,180,0.06)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 flex-shrink-0 no-underline">
        <div className="relative w-9 h-9">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 opacity-25 blur-sm" />
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
              border: isDark
                ? "1px solid rgba(0,212,255,0.45)"
                : "1px solid rgba(0,100,200,0.35)",
            }}
          >
            <span
              className="font-black text-base"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: isDark ? "#00d4ff" : "#005f88",
              }}
            >
              Q
            </span>
          </div>
        </div>
        <span
          className="text-lg font-bold tracking-widest"
          style={{
            fontFamily: "Orbitron, sans-serif",
            color: isDark ? "#00d4ff" : "#005f88",
          }}
        >
          Qumail
        </span>
      </Link>

      {/* Center tagline */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <span
          className="text-xs tracking-widest uppercase opacity-45"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          Quantum Secure Email Communication
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Login / Register button — swaps based on current page */}
        {!onLogin && !onRegister && (
          <Link to="/login" className="no-underline">
            <button
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              className="px-4 py-1.5 rounded-lg text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                background: btnHovered
                  ? "linear-gradient(135deg, #00d4ff, #a855f7)"
                  : "transparent",
                color: btnHovered ? "#030b1a" : isDark ? "#00d4ff" : "#005f88",
                border: isDark
                  ? "1px solid rgba(0,212,255,0.45)"
                  : "1px solid rgba(0,100,200,0.4)",
                boxShadow: btnHovered ? "0 0 18px rgba(0,212,255,0.35)" : "none",
              }}
            >
              Login
            </button>
          </Link>
        )}

        {onLogin && (
          <Link to="/register" className="no-underline">
            <button
              className="px-4 py-1.5 rounded-lg text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                background: "transparent",
                color: isDark ? "#a855f7" : "#7c3aed",
                border: isDark
                  ? "1px solid rgba(168,85,247,0.45)"
                  : "1px solid rgba(124,58,237,0.4)",
              }}
            >
              Register
            </button>
          </Link>
        )}

        {onRegister && (
          <Link to="/login" className="no-underline">
            <button
              className="px-4 py-1.5 rounded-lg text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                background: "transparent",
                color: isDark ? "#00d4ff" : "#005f88",
                border: isDark
                  ? "1px solid rgba(0,212,255,0.45)"
                  : "1px solid rgba(0,100,200,0.4)",
              }}
            >
              Login
            </button>
          </Link>
        )}

        {/* Dark/light toggle */}
        <button
          onClick={onToggle}
          aria-label="Toggle color theme"
          className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
          style={{
            background: isDark
              ? "linear-gradient(90deg, rgba(0,212,255,0.22), rgba(168,85,247,0.22))"
              : "linear-gradient(90deg, rgba(0,100,200,0.12), rgba(124,58,237,0.12))",
            border: isDark
              ? "1px solid rgba(0,212,255,0.38)"
              : "1px solid rgba(0,100,200,0.32)",
          }}
        >
          <span
            className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
            style={{
              left: isDark ? "2px" : "calc(100% - 26px)",
              background: isDark
                ? "linear-gradient(135deg, #00d4ff, #0099bb)"
                : "linear-gradient(135deg, #a855f7, #7c3aed)",
            }}
          >
            {isDark
              ? <Moon className="w-3.5 h-3.5 text-gray-900" />
              : <Sun className="w-3.5 h-3.5 text-white" />}
          </span>
        </button>
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ isDark }: { isDark: boolean }) {
  return (
    <footer className="relative py-8" style={{ zIndex: 1 }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className="h-px mb-6"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.26) 40%, rgba(168,85,247,0.26) 60%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(0,100,200,0.18) 40%, rgba(124,58,237,0.18) 60%, transparent 100%)",
          }}
        />
        <p
          className="text-center text-xs opacity-35"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          &copy; Qumail Application 2026 &mdash; All communications protected by post-quantum cryptography
        </p>
      </div>
    </footer>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function Root() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(!isDark) }}>
      <div
        className="min-h-screen bg-background text-foreground relative overflow-x-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Particle canvas */}
        <ParticleCanvas isDark={isDark} />

        {/* Ambient glow orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div
            className="absolute w-[520px] h-[520px] rounded-full blur-3xl"
            style={{
              top: "-8%",
              left: "-6%",
              background: isDark
                ? "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(0,100,200,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
            style={{
              bottom: "4%",
              right: "-4%",
              background: isDark
                ? "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            opacity: 0.022,
            backgroundImage: isDark
              ? "linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)"
              : "linear-gradient(rgba(0,100,200,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,100,200,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <Navbar isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <Outlet />
        <Footer isDark={isDark} />
      </div>
    </ThemeContext.Provider>
  );
}
