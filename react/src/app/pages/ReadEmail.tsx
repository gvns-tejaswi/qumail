import { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { useParams } from "react-router";

import {
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Star,
  Edit,
  Bell,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Inbox,
  Reply,
  Forward,
  Archive,
  MoreVertical,
  Download,
  Paperclip,
  Shield,
  Lock,
  CheckCircle,
  ArrowLeft,
  FileIcon,
} from "lucide-react";
import { ProfileDropdown } from "../components/ProfileDropdown";

// Theme context
interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

type MailFolder = "inbox" | "sent" | "drafts" | "trash" | "spam" | "starred";

function ReadEmailContent() {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeFolder, setActiveFolder] = useState<MailFolder>("inbox");
  const [isStarred, setIsStarred] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [mailData, setMailData] = useState<any>(null);
  useEffect(() => {

  if (countdown > 0) {

    const timer = setTimeout(() => {

      setCountdown(countdown - 1);

    }, 1000);

    return () => clearTimeout(timer);

  } else {

    setCanResend(true);

  }

}, [countdown]);

  useEffect(() => {

  const sendOtp = async () => {

    try {

      const token = localStorage.getItem("access");

      await fetch(

        `http://127.0.0.1:8000/send-otp/${id}/`,

        {

          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {

      console.log(error);

    }
  };

  sendOtp();

}, []);


  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {

  const enteredOtp = otp.join("");

  try {

    const token = localStorage.getItem("access");

    const response = await fetch(

      "http://127.0.0.1:8000/verify-otp/",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({

          otp: enteredOtp
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      setOtpVerified(true);
      const mailResponse = await fetch(

  `http://127.0.0.1:8000/decrypt-mail/${id}/`,

  {

    headers: {

      Authorization: `Bearer ${token}`,
    },
  }
);

const mail = await mailResponse.json();

setMailData(mail);
      setIsDecrypting(true);

      let progress = 0;

      const interval = setInterval(() => {

        progress += 10;

        setDecryptProgress(progress);

        if (progress >= 100) {

          clearInterval(interval);

          setTimeout(() => {

            setShowOtpDialog(false);

          }, 500);
        }

      }, 200);

    } else {

      alert(data.error || data.message);

    }

  } catch (error) {

    console.log(error);

  }
};

const handleOtpChange = (index: number, value: string) => {

  if (!/^\d*$/.test(value)) return;

  const updatedOtp = [...otp];

  updatedOtp[index] = value;

  setOtp(updatedOtp);

  if (value && index < 5) {

    const nextInput = document.getElementById(`otp-${index + 1}`);

    nextInput?.focus();
  }
};

const handleResendOtp = async () => {

  if (!canResend) return;

  try {

    const token = localStorage.getItem("access");

    await fetch(

      `http://127.0.0.1:8000/send-otp/${id}/`,

      {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,
        },
      }
    );

    setCountdown(45);

    setCanResend(false);

    setOtp(["", "", "", "", "", ""]);

  } catch (error) {

    console.log(error);

  }
};

  const handleCancelOtp = () => {
    navigate("/dashboard");
  };

  const handleDeleteMail = async () => {

  try {

    console.log(id);

    const token = localStorage.getItem("access");

    const response = await fetch(

      `http://127.0.0.1:8000/delete-mail/${Number(id)}/`,

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response);

    if (response.ok) {

      navigate("/dashboard");
    }

  } catch (error) {

    console.log(error);
  }
};
  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const folders = [
    { id: "inbox" as MailFolder, label: "Inbox", icon: Inbox, count: 12 },
    { id: "sent" as MailFolder, label: "Sent", icon: Send, count: null },
    { id: "drafts" as MailFolder, label: "Drafts", icon: FileText, count: 3 },
    { id: "starred" as MailFolder, label: "Starred", icon: Star, count: null },
    { id: "spam" as MailFolder, label: "Spam", icon: AlertOctagon, count: 2 },
    { id: "trash" as MailFolder, label: "Trash", icon: Trash2, count: null },
  ];

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

      {/* Main Content Area */}
      <div className="flex pt-16" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Left Sidebar */}
        <aside
          className="w-64 border-r flex-shrink-0 p-4 space-y-4 overflow-y-auto hide-scrollbar"
          style={{
            borderRight: isDark
              ? "1px solid rgba(0,212,255,0.1)"
              : "1px solid rgba(0,100,200,0.1)",
          }}
        >
          {/* Compose Button */}
          <button
            onClick={() => navigate("/compose")}
            className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #a855f7)",
              color: "#030b1a",
              boxShadow: "0 4px 22px rgba(0,212,255,0.35), 0 0 40px rgba(168,85,247,0.2)",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
            }}
          >
            <Edit className="w-4 h-4" />
            Compose
          </button>

          {/* Folder List */}
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    if (folder.id === "inbox") {
                      navigate("/dashboard");
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: isActive
                      ? isDark
                        ? "rgba(0,212,255,0.12)"
                        : "rgba(0,100,200,0.12)"
                      : "transparent",
                    border: isActive
                      ? isDark
                        ? "1px solid rgba(0,212,255,0.3)"
                        : "1px solid rgba(0,100,200,0.3)"
                      : "1px solid transparent",
                    color: isActive
                      ? isDark
                        ? "#00d4ff"
                        : "#005f88"
                      : isDark
                      ? "rgba(226,238,255,0.7)"
                      : "rgba(10,22,40,0.7)",
                    boxShadow: isActive
                      ? isDark
                        ? "0 0 15px rgba(0,212,255,0.15)"
                        : "0 0 15px rgba(0,100,200,0.1)"
                      : "none",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left text-sm font-medium">{folder.label}</span>
                  {folder.count !== null && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: isDark ? "rgba(168,85,247,0.2)" : "rgba(124,58,237,0.15)",
                        color: isDark ? "#a855f7" : "#7c3aed",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area - Email Reading */}
        <main className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
          <div className="p-6 max-w-5xl mx-auto w-full">
            {/* Back to Inbox */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 mb-6 text-sm transition-all duration-200 hover:gap-3"
              style={{
                color: isDark ? "#00d4ff" : "#005f88",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Inbox
            </button>

            {/* Email Card */}
            <div
              className="rounded-2xl overflow-hidden mb-6"
              style={{
                background: isDark ? "rgba(5,18,50,0.62)" : "rgba(255,255,255,0.8)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: isDark
                  ? "1px solid rgba(0,212,255,0.13)"
                  : "1px solid rgba(0,100,200,0.14)",
                boxShadow: isDark
                  ? "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "0 24px 80px rgba(0,60,160,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Email Header */}
              <div
                className="p-8 pb-6"
                style={{
                  borderBottom: isDark
                    ? "1px solid rgba(0,212,255,0.09)"
                    : "1px solid rgba(0,100,200,0.09)",
                }}
              >
                {/* Subject */}
                <h1
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: isDark ? "#e2eeff" : "#0a1628",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  {mailData?.subject}
                </h1>

                {/* Sender Info */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, #00d4ff, #a855f7)"
                          : "linear-gradient(135deg, #0082b4, #7c3aed)",
                        color: "#ffffff",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    >
                      {mailData?.sender?.[0]?.toUpperCase()}
                    </div>

                    <div>
                      <h3
                        className="font-semibold text-base mb-1"
                        style={{ color: isDark ? "#e2eeff" : "#0a1628" }}
                      >
                        {mailData?.username}
                      </h3>
                      <p
                        className="text-sm mb-1"
                        style={{ color: isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)" }}
                      >
                        From: {mailData?.sender}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: isDark ? "rgba(226,238,255,0.45)" : "rgba(10,22,40,0.45)" }}
                      >
                        To: You
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right">
                    <p
                      className="text-sm mb-1"
                      style={{
                        color: isDark ? "rgba(226,238,255,0.7)" : "rgba(10,22,40,0.7)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {mailData?.created_at }
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: isDark ? "rgba(226,238,255,0.45)" : "rgba(10,22,40,0.45)" }}
                    >
                      {mailData?.relativeTime}
                    </p>
                  </div>
                </div>

                {/* Security Status Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Encrypted Badge */}
                  <div
                    className="px-3 py-1.5 rounded-lg flex items-center gap-2"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.12)" : "rgba(0,100,200,0.12)",
                      border: isDark
                        ? "1px solid rgba(0,212,255,0.3)"
                        : "1px solid rgba(0,100,200,0.3)",
                      boxShadow: isDark ? "0 0 15px rgba(0,212,255,0.15)" : "0 0 15px rgba(0,100,200,0.1)",
                    }}
                  >
                    <Lock className="w-3.5 h-3.5" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: isDark ? "#00d4ff" : "#005f88",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      ENCRYPTED
                    </span>
                  </div>

                  {/* Quantum Secured */}
                  <div
                    className="px-3 py-1.5 rounded-lg flex items-center gap-2"
                    style={{
                      background: isDark ? "rgba(168,85,247,0.12)" : "rgba(124,58,237,0.12)",
                      border: isDark
                        ? "1px solid rgba(168,85,247,0.3)"
                        : "1px solid rgba(124,58,237,0.3)",
                      boxShadow: isDark ? "0 0 15px rgba(168,85,247,0.15)" : "0 0 15px rgba(124,58,237,0.1)",
                    }}
                  >
                    <Shield className="w-3.5 h-3.5" style={{ color: isDark ? "#a855f7" : "#7c3aed" }} />
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: isDark ? "#a855f7" : "#7c3aed",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      QUANTUM SECURED
                    </span>
                  </div>

                  {/* Verified */}
                  <div
                    className="px-3 py-1.5 rounded-lg flex items-center gap-2"
                    style={{
                      background: isDark ? "rgba(0,255,136,0.12)" : "rgba(0,204,102,0.12)",
                      border: isDark
                        ? "1px solid rgba(0,255,136,0.3)"
                        : "1px solid rgba(0,204,102,0.3)",
                    }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: isDark ? "#00ff88" : "#00cc66" }} />
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: isDark ? "#00ff88" : "#00cc66",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                className="px-8 py-4 flex items-center gap-2"
                style={{
                  background: isDark ? "rgba(0,212,255,0.02)" : "rgba(0,100,200,0.02)",
                  borderBottom: isDark
                    ? "1px solid rgba(0,212,255,0.08)"
                    : "1px solid rgba(0,100,200,0.08)",
                }}
              >
                <button
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    border: isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(0,100,200,0.25)",
                    color: isDark ? "#00d4ff" : "#005f88",
                  }}
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>

                <button
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    border: isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(0,100,200,0.25)",
                    color: isDark ? "#00d4ff" : "#005f88",
                  }}
                >
                  <Forward className="w-4 h-4" />
                  Forward
                </button>
                {!mailData?.is_read && (
                    <button
                        className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{
                        background: isDark ? "rgba(255,170,0,0.1)" : "rgba(255,136,0,0.1)",
                        border: isDark
                            ? "1px solid rgba(255,170,0,0.25)"
                            : "1px solid rgba(255,136,0,0.25)",
                        color: isDark ? "#ffaa00" : "#ff8800",
                        }}
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    )}
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{
                    background: isStarred
                      ? isDark ? "rgba(255,170,0,0.15)" : "rgba(255,136,0,0.15)"
                      : isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                    border: isStarred
                      ? isDark ? "1px solid rgba(255,170,0,0.4)" : "1px solid rgba(255,136,0,0.4)"
                      : isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                    color: isStarred
                      ? isDark ? "#ffaa00" : "#ff8800"
                      : isDark ? "#00d4ff" : "#005f88",
                    boxShadow: isStarred
                      ? isDark ? "0 0 20px rgba(255,170,0,0.3)" : "0 0 20px rgba(255,136,0,0.2)"
                      : "none",
                  }}
                >
                  <Star className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} />
                </button>

                <button
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                    border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                    color: isDark ? "#00d4ff" : "#005f88",
                  }}
                >
                  <Archive className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(255,68,68,0.08)" : "rgba(204,0,0,0.08)",
                    border: isDark ? "1px solid rgba(255,68,68,0.2)" : "1px solid rgba(204,0,0,0.2)",
                    color: isDark ? "#ff4444" : "#cc0000",
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex-1" />

                <button
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                    border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                    color: isDark ? "#00d4ff" : "#005f88",
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Email Body */}
              <div className="p-8">
                <div
                  className="prose max-w-none"
                  style={{
                    color: isDark ? "rgba(226,238,255,0.85)" : "rgba(10,22,40,0.85)",
                    lineHeight: "1.75",
                    fontSize: "0.95rem",
                  }}
                >
                  {(mailData?.message || "").split("\n").map((paragraph: string, idx: number) => (
                    <p
                      key={idx}
                      className="mb-4"
                      style={{
                        color: isDark ? "rgba(226,238,255,0.85)" : "rgba(10,22,40,0.85)",
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Attachments Section */}
              {mailData?.attachments?.length > 0 && ( 
                <div
                  className="px-8 py-6"
                  style={{
                    borderTop: isDark
                      ? "1px solid rgba(0,212,255,0.08)"
                      : "1px solid rgba(0,100,200,0.08)",
                    background: isDark ? "rgba(0,212,255,0.02)" : "rgba(0,100,200,0.02)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-4 uppercase tracking-wider"
                    style={{
                      color: isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    Attachments ({mailData.attachments.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mailData?.attachments?.map((attachment: any) => (
                        <div
                            key={attachment.id}
                            className="rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                            background: isDark ? "rgba(0,212,255,0.06)" : "rgba(0,100,200,0.06)",
                            border: isDark
                                ? "1px solid rgba(0,212,255,0.18)"
                                : "1px solid rgba(0,100,200,0.18)",
                            backdropFilter: "blur(12px)",
                            }}
                        >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isDark ? "rgba(168,85,247,0.15)" : "rgba(124,58,237,0.15)",
                          }}
                        >
                          <FileIcon className="w-5 h-5" style={{ color: isDark ? "#a855f7" : "#7c3aed" }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: isDark ? "#e2eeff" : "#0a1628" }}
                          >
                            {attachment.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p
                              className="text-xs"
                              style={{
                                color: isDark ? "rgba(226,238,255,0.5)" : "rgba(10,22,40,0.5)",
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {attachment.size}
                            </p>
                            {attachment.encrypted && (
                              <div className="flex items-center gap-1">
                                <Lock className="w-3 h-3" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                                <span
                                  className="text-xs"
                                  style={{
                                    color: isDark ? "#00d4ff" : "#005f88",
                                    fontFamily: "JetBrains Mono, monospace",
                                  }}
                                >
                                  Encrypted
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          style={{
                            background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                            border: isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(0,100,200,0.25)",
                            color: isDark ? "#00d4ff" : "#005f88",
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Section */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: isDark ? "rgba(5,18,50,0.62)" : "rgba(255,255,255,0.8)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: isDark
                  ? "1px solid rgba(0,212,255,0.13)"
                  : "1px solid rgba(0,100,200,0.14)",
                boxShadow: isDark
                  ? "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "0 24px 80px rgba(0,60,160,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <div className="p-6">
                <h3
                  className="text-sm font-semibold mb-4 uppercase tracking-wider"
                  style={{
                    color: isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Reply
                </h3>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={6}
                  className="w-full rounded-xl p-4 text-sm mb-4 resize-none transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.05)" : "rgba(0,100,200,0.04)",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.15)"
                      : "1px solid rgba(0,100,200,0.15)",
                    color: isDark ? "#e2eeff" : "#0a1628",
                    outline: "none",
                  }}
                />

                <div className="flex items-center gap-3">
                  <button
                    className="px-6 py-2.5 rounded-xl font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                      color: "#030b1a",
                      boxShadow: "0 4px 22px rgba(0,212,255,0.35)",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                    }}
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>

                  <button
                    className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                      border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                      color: isDark ? "#00d4ff" : "#005f88",
                    }}
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach
                  </button>

                  <div className="flex-1" />

                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                    <span
                      className="text-xs"
                      style={{
                        color: isDark ? "#00d4ff" : "#005f88",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      Quantum Encryption Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer
        className="border-t py-4"
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

      {/* OTP Verification Dialog */}
      {showOtpDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: isDark ? "rgba(3,11,26,0.92)" : "rgba(10,22,40,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 1002,
          }}
        >
          <div
            className="rounded-2xl overflow-hidden w-full max-w-md mx-4"
            style={{
              background: isDark ? "rgba(5,18,50,0.95)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: isDark
                ? "1px solid rgba(0,212,255,0.25)"
                : "1px solid rgba(0,100,200,0.25)",
              boxShadow: isDark
                ? "0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 24px 80px rgba(0,60,160,0.2), 0 0 40px rgba(0,100,200,0.1), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            {!isDecrypting ? (
              <div className="p-6">
                {/* Security Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="relative w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))"
                        : "linear-gradient(135deg, rgba(0,100,200,0.15), rgba(124,58,237,0.15))",
                      border: isDark
                        ? "2px solid rgba(0,212,255,0.3)"
                        : "2px solid rgba(0,100,200,0.3)",
                      boxShadow: isDark
                        ? "0 0 30px rgba(0,212,255,0.25)"
                        : "0 0 30px rgba(0,100,200,0.2)",
                    }}
                  >
                    <Shield className="w-6 h-6" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                  </div>
                </div>

                {/* Heading */}
                <h2
                  className="text-xl font-bold text-center mb-2"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    color: isDark ? "#e2eeff" : "#0a1628",
                  }}
                >
                  OTP Verification
                </h2>

                {/* Description */}
                <p
                  className="text-center text-xs mb-1"
                  style={{
                    color: isDark ? "rgba(226,238,255,0.7)" : "rgba(10,22,40,0.7)",
                    lineHeight: "1.5",
                  }}
                >
                  An OTP has been sent to your registered email address.
                </p>
                <p
                  className="text-center text-xs mb-4"
                  style={{
                    color: isDark ? "rgba(226,238,255,0.5)" : "rgba(10,22,40,0.5)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Please enter the verification code below.
                </p>

                {/* OTP Input Boxes */}
                <div className="flex gap-2 justify-center mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-lg transition-all duration-200"
                      style={{
                        background: isDark ? "rgba(0,212,255,0.05)" : "rgba(0,100,200,0.04)",
                        border: digit
                          ? isDark
                            ? "2px solid rgba(0,212,255,0.5)"
                            : "2px solid rgba(0,100,200,0.5)"
                          : isDark
                          ? "1px solid rgba(0,212,255,0.2)"
                          : "1px solid rgba(0,100,200,0.2)",
                        color: isDark ? "#e2eeff" : "#0a1628",
                        outline: "none",
                        boxShadow: digit
                          ? isDark
                            ? "0 0 20px rgba(0,212,255,0.2)"
                            : "0 0 20px rgba(0,100,200,0.15)"
                          : "none",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className="text-center mb-4">
                  <p
                    className="text-xs"
                    style={{
                      color: countdown < 10
                        ? isDark ? "#ff4444" : "#cc0000"
                        : isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {canResend ? "You can now resend OTP" : `Resend OTP in ${countdown} seconds`}
                  </p>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-2.5 rounded-xl font-semibold tracking-widest uppercase transition-all duration-200 mb-3 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                    color: "#030b1a",
                    boxShadow: "0 4px 22px rgba(0,212,255,0.28)",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                  }}
                >
                  Verify OTP
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={handleResendOtp}
                    disabled={!canResend}
                    className="flex-1 py-2 rounded-lg font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "transparent",
                      border: isDark ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(0,100,200,0.3)",
                      color: isDark ? "#00d4ff" : "#005f88",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={handleCancelOtp}
                    className="flex-1 py-2 rounded-lg font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: isDark ? "rgba(255,68,68,0.1)" : "rgba(204,0,0,0.1)",
                      border: isDark ? "1px solid rgba(255,68,68,0.25)" : "1px solid rgba(204,0,0,0.25)",
                      color: isDark ? "#ff4444" : "#cc0000",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {/* Security Footer */}
                <div
                  className="pt-3 flex items-center justify-center gap-2"
                  style={{
                    borderTop: isDark
                      ? "1px solid rgba(0,212,255,0.1)"
                      : "1px solid rgba(0,100,200,0.1)",
                  }}
                >
                  <Lock className="w-3 h-3 opacity-30" />
                  <span
                    className="text-xs opacity-30"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    Quantum-Secured Verification
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8">
                {/* Decrypting Animation */}
                <div className="flex flex-col items-center">
                  {/* Animated Lock Icon */}
                  <div className="relative mb-6">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))"
                          : "linear-gradient(135deg, rgba(0,100,200,0.2), rgba(124,58,237,0.2))",
                        border: isDark
                          ? "2px solid rgba(0,212,255,0.4)"
                          : "2px solid rgba(0,100,200,0.4)",
                        boxShadow: isDark
                          ? "0 0 40px rgba(0,212,255,0.3)"
                          : "0 0 40px rgba(0,100,200,0.25)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      <Lock className="w-10 h-10" style={{ color: isDark ? "#00d4ff" : "#005f88" }} />
                    </div>
                  </div>

                  {/* Decrypting Text */}
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      color: isDark ? "#e2eeff" : "#0a1628",
                    }}
                  >
                    Decrypting Mail
                  </h3>

                  {/* Progress Percentage */}
                  <p
                    className="text-4xl font-bold mb-4"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: isDark ? "#00d4ff" : "#005f88",
                    }}
                  >
                    {decryptProgress}%
                  </p>

                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden mb-4"
                    style={{
                      background: isDark ? "rgba(0,212,255,0.1)" : "rgba(0,100,200,0.1)",
                    }}
                  >
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${decryptProgress}%`,
                        background: "linear-gradient(90deg, #00d4ff, #a855f7)",
                        boxShadow: isDark
                          ? "0 0 15px rgba(0,212,255,0.5)"
                          : "0 0 15px rgba(0,100,200,0.4)",
                      }}
                    />
                  </div>

                  {/* Status Text */}
                  <p
                    className="text-xs"
                    style={{
                      color: isDark ? "rgba(226,238,255,0.6)" : "rgba(10,22,40,0.6)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {decryptProgress < 30 && "Verifying quantum signature..."}
                    {decryptProgress >= 30 && decryptProgress < 60 && "Applying CRYSTALS-Kyber..."}
                    {decryptProgress >= 60 && decryptProgress < 90 && "Decrypting message content..."}
                    {decryptProgress >= 90 && "Complete!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: isDark ? "rgba(3,11,26,0.85)" : "rgba(10,22,40,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1001,
          }}
          onClick={cancelDelete}
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
                  Delete Email?
                </h3>
              </div>

              <p
                className="text-sm mb-6"
                style={{
                  color: isDark ? "rgba(226,238,255,0.7)" : "rgba(10,22,40,0.7)",
                  lineHeight: "1.6",
                }}
              >
                Are you sure you want to delete this email? This email will be moved to trash and can be recovered for 30 days.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
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
                  onClick={handleDeleteMail}
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
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReadEmail() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(!isDark) }}>
      <ReadEmailContent />
    </ThemeContext.Provider>
  );
}
