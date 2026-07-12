import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, User, Phone, Shield, UserPlus } from "lucide-react";
import { FormInput, GradButton, glassCardStyle } from "../components/FormElements";

export default function Register() {
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
      className="opacity-50 hover:opacity-75 transition-opacity"
      style={{ color: "#7A6D63" }}
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
      {/* Page glow */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          background: "radial-gradient(circle, rgba(184,155,94,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md py-14">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={glassCardStyle(false)}>

          {/* Card header */}
          <div
            className="px-8 pt-8 pb-6"
            style={{ borderBottom: "1px solid #E6DDD2" }}
          >
            {/* Icon badge */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(184,155,94,0.12)",
                border: "1px solid rgba(184,155,94,0.35)",
              }}
            >
              <UserPlus className="w-5 h-5" style={{ color: "#B89B5E" }} />
            </div>
            <h1
              className="font-bold mb-1.5"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.05rem",
                color: "#3B2A23",
              }}
            >
              Create Your Quantum Vault
            </h1>
            <p className="text-xs leading-relaxed" style={{ color: "#7A6D63" }}>
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
              isDark={false}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormInput
              label="Create Email Address"
              type="email"
              placeholder="aiden@qumail.io"
              icon={<Mail className="w-4 h-4" />}
              isDark={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              label="Mobile Number"
              type="tel"
              placeholder="+91 XXXXXXXXXX"
              icon={<Phone className="w-4 h-4" />}
              isDark={false}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FormInput
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
              isDark={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightEl={eyeBtn(showPass, () => setShowPass(!showPass))}
            />
            <FormInput
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              icon={<Shield className="w-4 h-4" />}
              isDark={false}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              rightEl={eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))}
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="pt-2">
              <GradButton
                gradient="linear-gradient(135deg, #B89B5E 0%, #B89B5E 100%)"
                glow="0 4px 22px rgba(184,155,94,0.28)"
                glowHover="0 8px 36px rgba(184,155,94,0.45)"
                onClick={handleRegister}
              >
                Create Quantum Account
              </GradButton>
            </div>

            <p className="text-center text-xs" style={{ color: "#7A6D63" }}>
              Already secured?{" "}
              <Link
                to="/login"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: "#B89B5E" }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Card footer strip */}
          <div
            className="px-8 py-3 flex items-center gap-2 justify-center"
            style={{
              borderTop: "1px solid #E6DDD2",
              background: "rgba(184,155,94,0.025)",
            }}
          >
            <Shield className="w-3 h-3" style={{ color: "#A89B91", opacity: 0.6 }} />
            <span
              className="text-xs"
              style={{ fontFamily: "JetBrains Mono, monospace", color: "#A89B91" }}
            >
              TLS 1.3 · CRYSTALS-Kyber · CRYSTALS-Dilithium
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
