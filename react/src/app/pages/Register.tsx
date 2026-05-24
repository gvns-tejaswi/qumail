import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, User, Phone, Shield, UserPlus } from "lucide-react";
import { useTheme } from "../Root";
import { FormInput, GradButton, glassCardStyle } from "../components/FormElements";

export default function Register() {
  const { isDark } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleRegister = async () => {

  try {

    setError("");

    const response = await fetch(

      "http://127.0.0.1:8000/register/",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          name: name,

          email: email,

          password: password,

          confirm_password: confirmPassword,

          phone_number: phone
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      setError(data.error);

      return;
    }

    navigate("/login");

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
          transform: "translate(-50%, -55%)",
          background: isDark
            ? "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)",
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
                background: isDark ? "rgba(168,85,247,0.1)" : "rgba(124,58,237,0.08)",
                border: isDark ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(124,58,237,0.22)",
              }}
            >
              <UserPlus className="w-5 h-5" style={{ color: isDark ? "#a855f7" : "#7c3aed" }} />
            </div>
            <h1
              className="font-bold mb-1.5"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.05rem",
                color: isDark ? "#e2eeff" : "#0a1628",
              }}
            >
              Create Your Quantum Vault
            </h1>
            <p className="text-xs leading-relaxed" style={{ opacity: 0.44 }}>
              Join thousands securing their digital communications with quantum-grade encryption.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-3.5">
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Aiden Mercer"
              icon={<User className="w-4 h-4" />}
              isDark={isDark}
              value={name}
              onChange={(e) => setName(e.target.value)}
/>
            <FormInput
              label="Create Email Address"
              type="email"
              placeholder="aiden@qumail.io"
              icon={<Mail className="w-4 h-4" />}
              isDark={isDark}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              label="Mobile Number"
              type="tel"
              placeholder="+91 XXXXXXXXXX"
              icon={<Phone className="w-4 h-4" />}
              isDark={isDark}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
            <FormInput
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              icon={<Shield className="w-4 h-4" />}
              isDark={isDark}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              rightEl={eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))}
/>
                {
                  error && (

                    <p
                      className="text-red-400 text-sm"
                    >
                      {error}
                    </p>
                  )
                }
            <div className="pt-2">
              <GradButton
                gradient="linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)"
                glow="0 4px 22px rgba(0,212,255,0.28)"
                glowHover="0 8px 36px rgba(0,212,255,0.48)"
                onClick={handleRegister}
              >
                Create Quantum Account
              </GradButton>
            </div>

            <p className="text-center text-xs" style={{ opacity: 0.36 }}>
              Already secured?{" "}
              <Link
                to="/login"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: isDark ? "#00d4ff" : "#005f88" }}
              >
                Sign in
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
