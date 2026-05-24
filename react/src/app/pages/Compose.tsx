import { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bell,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Send,
  Paperclip,
  Save,
  Trash2,
  Shield,
  Lock,
  Users,
  X,
} from "lucide-react";
import { ProfileDropdown } from "../components/ProfileDropdown";

// Theme context
interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

function ComposeContent() {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [quantumEncryption, setQuantumEncryption] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "info";
} | null>(null);
const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const handleSend = async () => {
    if (!quantumEncryption) {

  setNotification({

  message: "Enable quantum encryption to send mail",

  type: "info"
});

setTimeout(() => {

  setNotification(null);

}, 3000);

return;

}

  try {

    const token = localStorage.getItem("access");

    const formData = new FormData();

    formData.append(
      "receivers",
      to
    );

    formData.append(
      "subject",
      subject
    );

    formData.append(
      "message",
      body
    );

    if (attachment) {

      formData.append(
        "attachment",
        attachment
      );
    }

    const response = await fetch(

      "http://127.0.0.1:8000/sendMail/",

      {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`
        },

        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.error || "Failed to send mail");

      return;
    }

    setNotification({

  message: "Secure mail sent successfully",

  type: "success"
});

setTimeout(() => {

  setNotification(null);

  navigate("/dashboard");

}, 2000);

  } catch (error) {

    console.log(error);

    setNotification({

      message: "Server error occurred",

      type: "info"
    });

    setTimeout(() => {

      setNotification(null);

    }, 3000);
  }
};

  const handleSaveDraft = async () => {

  try {

    const token = localStorage.getItem(
      "access"
    );

    const response = await fetch(

      "http://127.0.0.1:8000/saveDraft/",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({

          receivers: to,

          subject: subject,

          message: body
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      setNotification({

  message: "Server error occurred",

  type: "info"
});

setTimeout(() => {

  setNotification(null);

}, 3000);

      return;
    }

    setNotification({

  message: "Message saved as draft",

  type: "success"
});

setTimeout(() => {

  setNotification(null);
  navigate("/dashboard");

}, 1000);

  } catch (error) {

    console.log(error);

    alert(
      "Server error"
    );
  }
};

const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  const confirmDiscard = () => {
    setShowDiscardDialog(false);
    navigate("/dashboard");
  };

  const cancelDiscard = () => {
    setShowDiscardDialog(false);
  };

  const cardStyle = {
    background: isDark ? "rgba(5,18,50,0.62)" : "rgba(255,255,255,0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: isDark
      ? "1px solid rgba(0,212,255,0.13)"
      : "1px solid rgba(0,100,200,0.14)",
    boxShadow: isDark
      ? "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 24px 80px rgba(0,60,160,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(to bottom, #030b1a, #0a1628)"
          : "linear-gradient(to bottom, #f5f8ff, #e8f0ff)",
      }}
    >
      {/* Top Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6"
        style={{
          background: isDark ? "rgba(3,11,26,0.72)" : "rgba(255,255,255,0.78)",
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
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
              border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
              color: isDark ? "#00d4ff" : "#005f88",
            }}
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
              border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
              color: isDark ? "#00d4ff" : "#005f88",
            }}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <ProfileDropdown isDark={isDark} />

          {/* Dark/light toggle */}
          <button
            onClick={toggle}
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
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-gray-900" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-white" />
              )}
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pt-16">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: isDark ? "#e2eeff" : "#0a1628",
              }}
            >
              Compose Message
            </h1>
            <p
              className="text-sm"
              style={{ color: isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)" }}
            >
              Send a quantum-encrypted email securely.
            </p>
          </div>

          {/* Compose Card */}
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            {/* Header with Actions */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: isDark
                  ? "1px solid rgba(0,212,255,0.09)"
                  : "1px solid rgba(0,100,200,0.09)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                <h2
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    color: isDark ? "#e2eeff" : "#0a1628",
                  }}
                >
                  New Message
                </h2>
              </div>

              <button
                onClick={handleDiscard}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  background: isDark ? "rgba(255,68,68,0.08)" : "rgba(204,0,0,0.08)",
                  border: isDark ? "1px solid rgba(255,68,68,0.2)" : "1px solid rgba(204,0,0,0.2)",
                  color: isDark ? "#ff4444" : "#cc0000",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* To Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-xs tracking-wider uppercase"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: isDark ? "rgba(226,238,255,0.52)" : "rgba(10,22,40,0.48)",
                    }}
                  >
                    To
                  </label>
                  <div className="flex gap-2">
                    {!showCc && (
                      <button
                        onClick={() => setShowCc(true)}
                        className="text-xs hover:underline"
                        style={{ color: isDark ? "#00d4ff" : "#005f88" }}
                      >
                        Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button
                        onClick={() => setShowBcc(true)}
                        className="text-xs hover:underline"
                        style={{ color: isDark ? "#00d4ff" : "#005f88" }}
                      >
                        Bcc
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: isDark ? "rgba(226,238,255,0.3)" : "rgba(10,22,40,0.3)" }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@qumail.io"
                    className="w-full rounded-xl text-sm transition-all duration-200 pl-10 pr-4 py-2.5 placeholder:opacity-25"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.04)" : "rgba(0,100,200,0.03)",
                      border: isDark
                        ? "1px solid rgba(0,212,255,0.18)"
                        : "1px solid rgba(0,100,200,0.2)",
                      color: isDark ? "#e2eeff" : "#0a1628",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Cc Field */}
              {showCc && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-xs tracking-wider uppercase"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: isDark ? "rgba(226,238,255,0.52)" : "rgba(10,22,40,0.48)",
                      }}
                    >
                      Cc
                    </label>
                    <button
                      onClick={() => setShowCc(false)}
                      className="text-xs hover:underline"
                      style={{ color: isDark ? "#ff4444" : "#cc0000" }}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@qumail.io"
                    className="w-full rounded-xl text-sm transition-all duration-200 px-4 py-2.5 placeholder:opacity-25"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.04)" : "rgba(0,100,200,0.03)",
                      border: isDark
                        ? "1px solid rgba(0,212,255,0.18)"
                        : "1px solid rgba(0,100,200,0.2)",
                      color: isDark ? "#e2eeff" : "#0a1628",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Bcc Field */}
              {showBcc && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-xs tracking-wider uppercase"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: isDark ? "rgba(226,238,255,0.52)" : "rgba(10,22,40,0.48)",
                      }}
                    >
                      Bcc
                    </label>
                    <button
                      onClick={() => setShowBcc(false)}
                      className="text-xs hover:underline"
                      style={{ color: isDark ? "#ff4444" : "#cc0000" }}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="email"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@qumail.io"
                    className="w-full rounded-xl text-sm transition-all duration-200 px-4 py-2.5 placeholder:opacity-25"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.04)" : "rgba(0,100,200,0.03)",
                      border: isDark
                        ? "1px solid rgba(0,212,255,0.18)"
                        : "1px solid rgba(0,100,200,0.2)",
                      color: isDark ? "#e2eeff" : "#0a1628",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Subject Field */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs tracking-wider uppercase"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: isDark ? "rgba(226,238,255,0.52)" : "rgba(10,22,40,0.48)",
                  }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full rounded-xl text-sm transition-all duration-200 px-4 py-2.5 placeholder:opacity-25"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.04)" : "rgba(0,100,200,0.03)",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.18)"
                      : "1px solid rgba(0,100,200,0.2)",
                    color: isDark ? "#e2eeff" : "#0a1628",
                    outline: "none",
                  }}
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs tracking-wider uppercase"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: isDark ? "rgba(226,238,255,0.52)" : "rgba(10,22,40,0.48)",
                  }}
                >
                  Message
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your quantum-encrypted message..."
                  rows={12}
                  className="w-full rounded-xl text-sm transition-all duration-200 px-4 py-3 resize-none placeholder:opacity-25"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.04)" : "rgba(0,100,200,0.03)",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.18)"
                      : "1px solid rgba(0,100,200,0.2)",
                    color: isDark ? "#e2eeff" : "#0a1628",
                    outline: "none",
                    lineHeight: "1.6",
                  }}
                />
              </div>

              {/* Quantum Encryption Toggle */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{
                  background: isDark ? "rgba(168,85,247,0.08)" : "rgba(124,58,237,0.08)",
                  border: isDark
                    ? "1px solid rgba(168,85,247,0.2)"
                    : "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" style={{ color: isDark ? "#a855f7" : "#7c3aed" }} />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: isDark ? "rgba(226,238,255,0.85)" : "rgba(10,22,40,0.85)" }}
                    >
                      Quantum Encryption
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: isDark ? "rgba(226,238,255,0.45)" : "rgba(10,22,40,0.45)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      End-to-end post-quantum cryptography enabled
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuantumEncryption(!quantumEncryption)}
                  className="relative w-12 h-6 rounded-full transition-all duration-300"
                  style={{
                    background: quantumEncryption
                      ? isDark
                        ? "linear-gradient(90deg, #00d4ff, #a855f7)"
                        : "linear-gradient(90deg, #0082b4, #7c3aed)"
                      : isDark
                      ? "rgba(226,238,255,0.15)"
                      : "rgba(10,22,40,0.15)",
                    border: quantumEncryption
                      ? isDark
                        ? "1px solid rgba(0,212,255,0.4)"
                        : "1px solid rgba(0,100,200,0.4)"
                      : isDark
                      ? "1px solid rgba(226,238,255,0.2)"
                      : "1px solid rgba(10,22,40,0.2)",
                    boxShadow: quantumEncryption
                      ? isDark
                        ? "0 0 15px rgba(0,212,255,0.3)"
                        : "0 0 15px rgba(0,100,200,0.2)"
                      : "none",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                    style={{
                      left: quantumEncryption ? "calc(100% - 22px)" : "2px",
                      background: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSend}
                  className="flex-1 py-3 rounded-xl font-semibold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                    color: "#030b1a",
                    boxShadow: "0 4px 22px rgba(0,212,255,0.28)",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>

                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-3 rounded-xl font-semibold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] flex items-center gap-2"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    border: isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(0,100,200,0.25)",
                    color: isDark ? "#00d4ff" : "#005f88",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  <Save className="w-4 h-4" />
                  Draft
                </button>

                <label
                  className="px-6 py-3 rounded-xl font-semibold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.25)"
                      : "1px solid rgba(0,100,200,0.25)",
                    color: isDark ? "#00d4ff" : "#005f88",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  <Paperclip className="w-4 h-4" />

                  {attachment ? attachment.name : "Attach"}

                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAttachment(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Footer Security Badge */}
            <div
              className="px-6 py-3 flex items-center gap-2 justify-center"
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

      {/* Footer */}
      <footer
        className="py-4"
        style={{
          borderTop: isDark
            ? "1px solid rgba(0,212,255,0.1)"
            : "1px solid rgba(0,100,200,0.1)",
        }}
      >
        <p
          className="text-center text-xs opacity-35"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          &copy; Qumail Application 2026
        </p>
      </footer>
      {/* Notification Box */}
      {notification && (
        <div
          className="fixed bottom-6 right-6 rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl transition-all duration-300 animate-slide-up"
          style={{
            background: notification.type === "success"
              ? isDark
                ? "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,212,255,0.15))"
                : "linear-gradient(135deg, rgba(0,204,102,0.2), rgba(0,100,200,0.2))"
              : isDark
              ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))"
              : "linear-gradient(135deg, rgba(0,100,200,0.2), rgba(124,58,237,0.2))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: notification.type === "success"
              ? isDark
                ? "1px solid rgba(0,255,136,0.3)"
                : "1px solid rgba(0,204,102,0.3)"
              : isDark
              ? "1px solid rgba(0,212,255,0.3)"
              : "1px solid rgba(0,100,200,0.3)",
            boxShadow: notification.type === "success"
              ? isDark
                ? "0 8px 32px rgba(0,255,136,0.2)"
                : "0 8px 32px rgba(0,204,102,0.15)"
              : isDark
              ? "0 8px 32px rgba(0,212,255,0.2)"
              : "0 8px 32px rgba(0,100,200,0.15)",
            zIndex: 1000,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: notification.type === "success"
                ? isDark ? "#00ff88" : "#00cc66"
                : isDark ? "#00d4ff" : "#005f88",
              boxShadow: notification.type === "success"
                ? isDark ? "0 0 8px rgba(0,255,136,0.6)" : "0 0 8px rgba(0,204,102,0.6)"
                : isDark ? "0 0 8px rgba(0,212,255,0.6)" : "0 0 8px rgba(0,100,200,0.6)",
            }}
          />
          <p
            className="text-sm font-medium"
            style={{
              color: isDark ? "#e2eeff" : "#0a1628",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {notification.message}
          </p>
        </div>
      )}

      {/* Discard Confirmation Dialog */}
      {showDiscardDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: isDark ? "rgba(3,11,26,0.85)" : "rgba(10,22,40,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1001,
          }}
          onClick={cancelDiscard}
        >
          <div
            className="rounded-2xl overflow-hidden w-full max-w-md mx-4"
            style={{
              background: isDark ? "rgba(5,18,50,0.95)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: isDark
                ? "1px solid rgba(0,212,255,0.2)"
                : "1px solid rgba(0,100,200,0.2)",
              boxShadow: isDark
                ? "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 24px 80px rgba(0,60,160,0.2), inset 0 1px 0 rgba(255,255,255,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(255,68,68,0.15)" : "rgba(204,0,0,0.15)",
                  }}
                >
                  <Trash2 className="w-5 h-5" style={{ color: isDark ? "#ff4444" : "#cc0000" }} />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    color: isDark ? "#e2eeff" : "#0a1628",
                  }}
                >
                  Discard Message?
                </h3>
              </div>

              <p
                className="text-sm mb-6"
                style={{
                  color: isDark ? "rgba(226,238,255,0.7)" : "rgba(10,22,40,0.7)",
                  lineHeight: "1.6",
                }}
              >
                Are you sure you want to discard this message? This action cannot be undone and all your changes will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDiscard}
                  className="flex-1 py-2.5 rounded-xl font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    border: isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(0,100,200,0.25)",
                    color: isDark ? "#00d4ff" : "#005f88",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDiscard}
                  className="flex-1 py-2.5 rounded-xl font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, #ff4444, #cc0000)"
                      : "linear-gradient(135deg, #cc0000, #990000)",
                    color: "#ffffff",
                    boxShadow: isDark ? "0 4px 22px rgba(255,68,68,0.3)" : "0 4px 22px rgba(204,0,0,0.3)",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function Compose() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(!isDark) }}>
      <ComposeContent />
    </ThemeContext.Provider>
  );
}
