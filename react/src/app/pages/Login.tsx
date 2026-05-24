import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useTheme } from "../Root";
import { FormInput, GradButton, glassCardStyle } from "../components/FormElements";

export default function Login() {
  const { isDark } = useTheme();
  const [showPass, setShowPass] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const eyeBtn = (visible: boolean, toggle: () => void) => (
    <button
      onClick={toggle}
      className="opacity-38 hover:opacity-75 transition-opacity"
      style={{ color: isDark ? "#e2eeff" : "#0a1628" }}
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const handleLogin = async () => {

  try {

    setError("");

    const response = await fetch(

      "http://127.0.0.1:8000/login/",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          username: email,

          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      setError(data.error);

      return;
    }

    localStorage.setItem(

      "access",

      data.access
    );

    localStorage.setItem(

      "refresh",

      data.refresh
    );

    navigate("/dashboard");

  } catch (err) {

    setError("Server error");
  }
};

  return (
    <main
      className="relative pt-16 min-h-screen flex items-center justify-center px-6"
      style={{ zIndex: 1 }}
    >
      {/* Extra page glow */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          background: isDark
            ? "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,100,200,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md py-14">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={glassCardStyle(isDark)}>

          {/* Card header */}
          <div
            className="px-8 pt-8 pb-6"
            style={{
              borderBottom: isDark
                ? "1px solid rgba(0,212,255,0.09)"
                : "1px solid rgba(0,100,200,0.09)",
            }}
          >
            {/* Icon badge */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.09)",
                border: isDark ? "1px solid rgba(0,212,255,0.28)" : "1px solid rgba(0,100,200,0.22)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
            </div>
            <h1
              className="font-bold mb-1.5"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.05rem",
                color: isDark ? "#e2eeff" : "#0a1628",
              }}
            >
              Access Your Quantum Vault
            </h1>
            <p className="text-xs leading-relaxed" style={{ opacity: 0.44 }}>
              Authenticate to access your end-to-end encrypted inbox.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="aiden@qumail.io"
              icon={<Mail className="w-4 h-4" />}
              isDark={isDark}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <FormInput
                label="Password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                icon={<Lock className="w-4 h-4" />}
                isDark={isDark}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightEl={eyeBtn(showPass, () => setShowPass(!showPass))}
              />
              <div className="flex justify-end mt-2">
                <Link
                    to="/forgot-password"
                  className="text-xs hover:underline transition-all"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: isDark ? "#00d4ff" : "#005f88",
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
                    {
          error && (

            <p className="text-red-400 text-sm">

              {error}

            </p>
          )
        }

            <div className="pt-1">
              <GradButton
                gradient="linear-gradient(135deg, #a855f7 0%, #00d4ff 100%)"
                glow="0 4px 22px rgba(168,85,247,0.28)"
                glowHover="0 8px 36px rgba(168,85,247,0.48)"
                onClick={handleLogin}
              >
                Sign In
              </GradButton>
            </div>

            <p className="text-center text-xs" style={{ opacity: 0.36 }}>
              No account?{" "}
              <Link
                to="/register"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: isDark ? "#00d4ff" : "#005f88" }}
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Card footer strip */}
          <div
            className="px-8 py-3 flex items-center gap-2 justify-center"
            style={{
              borderTop: isDark
                ? "1px solid rgba(0,212,255,0.08)"
                : "1px solid rgba(0,100,200,0.08)",
              background: isDark ? "rgba(0,212,255,0.02)" : "rgba(0,100,200,0.02)",
            }}
          >
            <Shield className="w-3 h-3 opacity-28" />
            <span
              className="text-xs opacity-28"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              TLS 1.3 · CRYSTALS-Kyber · CRYSTALS-Dilithium
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
