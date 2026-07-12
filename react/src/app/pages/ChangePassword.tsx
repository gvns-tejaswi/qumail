import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { FormInput, GradButton, glassCardStyle } from "../components/FormElements";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Password strength calculation
  const getPasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 15;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 20;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(newPass);

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "#cc0000";
    if (strength < 70) return "#ff8800";
    return "#00cc66";
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return "";
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  const eyeBtn = (visible: boolean, toggle: () => void) => (
    <button
      onClick={toggle}
      type="button"
      className="opacity-50 hover:opacity-75 transition-opacity"
      style={{ color: "#7A6D63" }}
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const showNotification = (message: string, type: "success" | "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      setStep("otp");
      setResendTimer(30);
    } catch {
      showNotification("Server error occurred", "info");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/verify-forgot-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      setStep("reset");
    } catch {
      showNotification("Server error occurred", "info");
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      alert("OTP resent successfully");
      setResendTimer(30);
    } catch {
      showNotification("Server error occurred", "info");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { alert("Passwords do not match"); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPass, confirm_password: confirmPass }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error); return; }
      setStep("success");
    } catch {
      showNotification("Server error occurred", "info");
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
          transform: "translate(-50%, -60%)",
          background: "radial-gradient(circle, rgba(184,155,94,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md py-14">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={glassCardStyle(false)}>

          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid #E6DDD2" }}>
            {/* Icon badge */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(184,155,94,0.12)",
                border: "1px solid rgba(184,155,94,0.35)",
              }}
            >
              {step === "success" ? (
                <CheckCircle className="w-5 h-5" style={{ color: "#B89B5E" }} />
              ) : (
                <Shield className="w-5 h-5" style={{ color: "#B89B5E" }} />
              )}
            </div>
            <h1
              className="font-bold mb-1.5"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.05rem",
                color: "#3B2A23",
              }}
            >
              {step === "email" && "Quantum Vault Recovery"}
              {step === "otp" && "Verify Your Identity"}
              {step === "reset" && "Create New Password"}
              {step === "success" && "Password Reset Complete"}
            </h1>
            <p className="text-xs leading-relaxed" style={{ color: "#7A6D63" }}>
              {step === "email" && "Enter your registered Qumail address to receive OTP verification."}
              {step === "otp" && "We've sent a 6-digit code to your email. Enter it below to continue."}
              {step === "reset" && "Choose a strong password to secure your quantum vault."}
              {step === "success" && "Your password has been successfully reset. You can now sign in."}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="px-8 py-7 space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="aiden@qumail.io"
                icon={<Mail className="w-4 h-4" />}
                isDark={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="pt-1">
                <GradButton
                  gradient="linear-gradient(135deg, #B89B5E 0%, #B89B5E 100%)"
                  glow="0 4px 22px rgba(184,155,94,0.28)"
                  glowHover="0 8px 36px rgba(184,155,94,0.45)"
                >
                  Send OTP
                </GradButton>
              </div>
              <div className="flex items-center justify-center pt-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs hover:underline transition-all"
                  style={{ fontFamily: "JetBrains Mono, monospace", color: "#B89B5E" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="px-8 py-7 space-y-5">
              <div className="space-y-1.5">
                <label
                  className="block text-xs tracking-wider uppercase"
                  style={{ fontFamily: "JetBrains Mono, monospace", color: "#A89B91" }}
                >
                  Verification Code
                </label>
                <div className="flex justify-center py-3">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-11 h-12 text-base"
                          style={{
                            background: "#FFFDF9",
                            border: "1px solid #DCCFC0",
                            color: "#3B2A23",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Resend timer */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#A89B91" }}>
                    Resend in {String(Math.floor(resendTimer / 60)).padStart(2, "0")}:
                    {String(resendTimer % 60).padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-xs hover:underline transition-all"
                    style={{ fontFamily: "JetBrains Mono, monospace", color: "#B89B5E" }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="pt-1">
                <GradButton
                  gradient="linear-gradient(135deg, #B89B5E 0%, #B89B5E 100%)"
                  glow="0 4px 22px rgba(184,155,94,0.28)"
                  glowHover="0 8px 36px rgba(184,155,94,0.45)"
                >
                  Verify OTP
                </GradButton>
              </div>

              <div className="flex items-center justify-center pt-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs hover:underline transition-all"
                  style={{ fontFamily: "JetBrains Mono, monospace", color: "#B89B5E" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="px-8 py-7 space-y-4">
              <FormInput
                label="New Password"
                type={showNewPass ? "text" : "password"}
                placeholder="••••••••••••"
                icon={<Lock className="w-4 h-4" />}
                isDark={false}
                rightEl={eyeBtn(showNewPass, () => setShowNewPass(!showNewPass))}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              {/* Password strength indicator */}
              {newPass && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "#A89B91", fontFamily: "JetBrains Mono, monospace" }}>
                      Password Strength
                    </span>
                    <span style={{ color: getStrengthColor(passwordStrength), fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E6DDD2" }}>
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${passwordStrength}%`,
                        background: getStrengthColor(passwordStrength),
                        boxShadow: `0 0 8px ${getStrengthColor(passwordStrength)}66`,
                      }}
                    />
                  </div>
                </div>
              )}

              <FormInput
                label="Confirm Password"
                type={showConfirmPass ? "text" : "password"}
                placeholder="••••••••••••"
                icon={<Lock className="w-4 h-4" />}
                isDark={false}
                rightEl={eyeBtn(showConfirmPass, () => setShowConfirmPass(!showConfirmPass))}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />

              <div className="pt-1">
                <GradButton
                  gradient="linear-gradient(135deg, #B89B5E 0%, #B89B5E 100%)"
                  glow="0 4px 22px rgba(184,155,94,0.28)"
                  glowHover="0 8px 36px rgba(184,155,94,0.45)"
                >
                  Reset Password
                </GradButton>
              </div>

              <div className="flex items-center justify-center pt-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs hover:underline transition-all"
                  style={{ fontFamily: "JetBrains Mono, monospace", color: "#B89B5E" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="px-8 py-7 space-y-4">
              <div className="flex justify-center py-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(184,155,94,0.15) 0%, rgba(184,155,94,0.05) 100%)",
                    border: "2px solid rgba(184,155,94,0.4)",
                    boxShadow: "0 0 30px rgba(184,155,94,0.2)",
                  }}
                >
                  <CheckCircle className="w-10 h-10" style={{ color: "#B89B5E" }} />
                </div>
              </div>

              <div className="pt-1">
                <Link to="/login">
                  <GradButton
                    gradient="linear-gradient(135deg, #B89B5E 0%, #B89B5E 100%)"
                    glow="0 4px 22px rgba(184,155,94,0.28)"
                    glowHover="0 8px 36px rgba(184,155,94,0.45)"
                  >
                    Sign In Now
                  </GradButton>
                </Link>
              </div>
            </div>
          )}

          {/* Card footer strip */}
          <div
            className="px-8 py-3 flex items-center gap-2 justify-center"
            style={{ borderTop: "1px solid #E6DDD2", background: "rgba(184,155,94,0.025)" }}
          >
            <Shield className="w-3 h-3" style={{ color: "#A89B91", opacity: 0.6 }} />
            <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#A89B91" }}>
              TLS 1.3 · CRYSTALS-Kyber · CRYSTALS-Dilithium
            </span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed bottom-6 right-6 rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl"
          style={{
            background: notification.type === "success" ? "rgba(184,155,94,0.12)" : "rgba(59,42,35,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: notification.type === "success" ? "1px solid rgba(184,155,94,0.4)" : "1px solid #E6DDD2",
            boxShadow: "0 8px 32px rgba(59,42,35,0.12)",
            zIndex: 1000,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: notification.type === "success" ? "#B89B5E" : "#7A6D63",
              boxShadow: notification.type === "success" ? "0 0 8px rgba(184,155,94,0.6)" : "none",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "#3B2A23", fontFamily: "JetBrains Mono, monospace" }}>
            {notification.message}
          </p>
        </div>
      )}
    </main>
  );
}
