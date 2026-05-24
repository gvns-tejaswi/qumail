import { Link } from "react-router";
import { useTheme } from "../Root";

// ─── Quantum illustration ─────────────────────────────────────────────────────

function QuantumIllustration({ isDark }: { isDark: boolean }) {
  const hexPoints = "150,108 182,126 182,162 150,180 118,162 118,126";
  const orbitDots = Array.from({ length: 6 }, (_, i) => {
    const rad = (i * 60 * Math.PI) / 180;
    return { cx: 150 + 92 * Math.cos(rad), cy: 150 + 92 * Math.sin(rad), isPurple: i % 2 === 1 };
  });

  return (
    <div className="relative flex items-center justify-center w-full max-w-sm mx-auto">
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #00d4ff 0%, #a855f7 60%, transparent 100%)" }}
      />
      <svg viewBox="0 0 300 300" className="relative w-full h-auto">
        <defs>
          <filter id="q-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="q-glow-sm" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="q-bg-h" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.04" />
          </radialGradient>
          <linearGradient id="q-hex-h" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <circle cx="150" cy="150" r="140" fill="url(#q-bg-h)" />

        <circle cx="150" cy="150" r="128" fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.24" strokeDasharray="5 9">
          <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="42s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="92" fill="none" stroke="#a855f7" strokeWidth="0.6" strokeOpacity="0.28" strokeDasharray="8 5">
          <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="150" r="62" fill="none" stroke="#00d4ff" strokeWidth="0.9" strokeOpacity="0.42" />

        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={150 + 62 * Math.cos(rad)} y1={150 + 62 * Math.sin(rad)}
              x2={150 + 128 * Math.cos(rad)} y2={150 + 128 * Math.sin(rad)}
              stroke={angle % 120 === 0 ? "#00d4ff" : "#a855f7"}
              strokeWidth="0.5" strokeOpacity="0.28"
            />
          );
        })}

        {orbitDots.map(({ cx, cy, isPurple }, i) => (
          <circle key={i} cx={cx} cy={cy} r="2.8" fill={isPurple ? "#a855f7" : "#00d4ff"} opacity="0.7" filter="url(#q-glow-sm)" />
        ))}

        <polygon
          points={hexPoints}
          fill={isDark ? "rgba(3,11,26,0.85)" : "rgba(237,242,255,0.9)"}
          stroke="url(#q-hex-h)"
          strokeWidth="1.5"
          filter="url(#q-glow)"
        />

        <rect x="136" y="145" width="28" height="22" rx="5" fill="#00d4ff" opacity="0.92" filter="url(#q-glow-sm)" />
        <path d="M141 145 L141 138 Q141 129 150 129 Q159 129 159 138 L159 145" fill="none" stroke="#00d4ff" strokeWidth="2.8" strokeLinecap="round" filter="url(#q-glow-sm)" />
        <circle cx="150" cy="153" r="3.2" fill={isDark ? "#030b1a" : "#0a1628"} />
        <rect x="148.5" y="155.5" width="3" height="6" rx="1" fill={isDark ? "#030b1a" : "#0a1628"} />

        <g>
          <circle cx="150" cy="22" r="4.5" fill="#00d4ff" filter="url(#q-glow)">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="7s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <circle cx="55" cy="150" r="3.5" fill="#a855f7" filter="url(#q-glow)">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="-360 150 150" dur="5s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <circle cx="245" cy="105" r="3" fill="#00d4ff" opacity="0.8" filter="url(#q-glow-sm)">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="11s" repeatCount="indefinite" />
          </circle>
        </g>

        {([
          [150, 22], [278, 150], [150, 278], [22, 150],
        ] as [number, number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="none" stroke={i % 2 === 0 ? "#00d4ff" : "#a855f7"} strokeWidth="1.2" strokeOpacity="0.48" />
        ))}
      </svg>
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { isDark } = useTheme();

  return (
    <main className="relative pt-16 min-h-screen flex items-center" style={{ zIndex: 1 }}>
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* Left — text + CTAs */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-5">
              <h1
                className="font-black leading-[1.05]"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(2.2rem, 4.8vw, 4rem)",
                }}
              >
                <span className="block opacity-85">Welcome to</span>
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Qumail
                </span>
              </h1>
              <p
                className="text-lg font-medium leading-relaxed max-w-lg"
                style={{ opacity: 0.72 }}
              >
                Next-generation quantum-inspired encrypted email platform
              </p>
              <p className="text-sm leading-relaxed max-w-lg" style={{ opacity: 0.48 }}>
                Qumail uses post-quantum cryptographic protocols to keep your communications
                impenetrable — today and in the quantum era. End-to-end encrypted,
                zero-knowledge architecture, built for the future of secure digital correspondence.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register" className="no-underline">
                <button
                  className="px-7 py-3 rounded-xl font-semibold tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.16em",
                    background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
                    color: "#030b1a",
                    boxShadow: "0 4px 24px rgba(0,212,255,0.32)",
                  }}
                >
                  Get Started
                </button>
              </Link>
              <Link to="/login" className="no-underline">
                <button
                  className="px-7 py-3 rounded-xl font-semibold tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.16em",
                    background: "transparent",
                    color: isDark ? "#00d4ff" : "#005f88",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.45)"
                      : "1px solid rgba(0,100,200,0.42)",
                  }}
                >
                  Sign In
                </button>
              </Link>
            </div>

            {/* Trust line */}
            <p
              className="text-xs opacity-30 pt-2"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              CRYSTALS-Kyber &nbsp;·&nbsp; CRYSTALS-Dilithium &nbsp;·&nbsp; TLS 1.3
            </p>
          </div>

          {/* Right — illustration */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <QuantumIllustration isDark={isDark} />
          </div>

        </div>
      </div>
    </main>
  );
}
