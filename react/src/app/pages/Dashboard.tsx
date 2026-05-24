import { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Star,
  Edit,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Inbox,
  Paperclip,
} from "lucide-react";

// Theme context for dashboard
interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

type MailFolder = "inbox" | "sent" | "drafts" | "trash" | "spam" | "starred";

function DashboardContent() {
  const { isDark, toggle } = useTheme();
  const [activeFolder, setActiveFolder] = useState<MailFolder>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [emails, setEmails] = useState<any[]>([]);
  //const [showOtpDialog, setShowOtpDialog] = useState(false);
  const filteredEmails = emails.filter((email: any) => {

  if (activeFolder === "drafts") {
    return email.is_draft === true;
  }

  if (activeFolder === "starred") {
    return email.is_starred === true;
  }

  if (activeFolder === "inbox") {
    return !email.is_draft;
  }

  return true;
});
  useEffect(() => {
  fetchEmails();
}, [activeFolder]);
const toggleStar = async (mailId: number) => {

  try {

    const token = localStorage.getItem("access");

    await fetch(
      `http://127.0.0.1:8000/toggle-star/${mailId}/`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchEmails();

  } catch (error) {

    console.log(error);
  }
};
const fetchEmails = async () => {

  try {

    const token = localStorage.getItem("access");

    let endpoint = "";

    if (activeFolder === "inbox") {

  endpoint = "http://127.0.0.1:8000/inbox/";

} else if (activeFolder === "drafts") {

  endpoint = "http://127.0.0.1:8000/drafts/";

} else if (activeFolder === "sent") {

  endpoint = "http://127.0.0.1:8000/sent/";

} else if (activeFolder === "starred") {

  endpoint = "http://127.0.0.1:8000/starred/";

} else if (activeFolder === "trash") {

  endpoint = "http://127.0.0.1:8000/trash-mail/";

} else {

  setEmails([]);
  return;
}

    const response = await fetch(endpoint, {

      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();

console.log(data);

if (activeFolder === "drafts") {

  const formattedDrafts = data.map((draft: any) => ({
  ...draft,
  sender: draft.receivers || "Draft",
  preview: draft.message || "",
  time: draft.time,
  avatar: draft.receivers?.charAt(0)?.toUpperCase() || "D",
}));

  setEmails(formattedDrafts);

} else {

  setEmails(data);

}

  } catch (error) {

    console.log(error);
  }
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
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
              border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
              color: isDark ? "#00d4ff" : "#005f88",
            }}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #00d4ff, #a855f7)"
                : "linear-gradient(135deg, #0082b4, #7c3aed)",
              border: isDark ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(0,100,200,0.4)",
              color: "#ffffff",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <User className="w-4 h-4" />
          </button>

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
          <Link
            to="/compose"
            className="w-full py-3 px-5 rounded-xl font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2 no-underline"
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
          </Link>

          {/* Folder List */}
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
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

        {/* Right Content Area - Email List */}
        <main className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div
            className="border-b p-4"
            style={{
              borderBottom: isDark
                ? "1px solid rgba(0,212,255,0.1)"
                : "1px solid rgba(0,100,200,0.1)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: isDark ? "rgba(226,238,255,0.3)" : "rgba(10,22,40,0.3)" }}
                />
                <input
                  type="text"
                  placeholder="Search mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(0,212,255,0.05)" : "rgba(0,100,200,0.04)",
                    border: isDark
                      ? "1px solid rgba(0,212,255,0.15)"
                      : "1px solid rgba(0,100,200,0.15)",
                    color: isDark ? "#e2eeff" : "#0a1628",
                    outline: "none",
                  }}
                />
              </div>

              <button
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                  border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                  color: isDark ? "#00d4ff" : "#005f88",
                }}
              >
                <Filter className="w-4 h-4" />
              </button>

              <button
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:rotate-180"
                style={{
                  background: isDark ? "rgba(0,212,255,0.08)" : "rgba(0,100,200,0.08)",
                  border: isDark ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(0,100,200,0.2)",
                  color: isDark ? "#00d4ff" : "#005f88",
                  transition: "all 0.3s",
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            {filteredEmails.map((email: any) => (
              <div
                key={`${email.subject}-${email.time}`}
                className="rounded-xl p-4 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                style={{
                  background: email.unread
                    ? isDark
                      ? "rgba(0,212,255,0.06)"
                      : "rgba(0,100,200,0.06)"
                    : isDark
                    ? "rgba(5,18,50,0.4)"
                    : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: email.unread
                    ? isDark
                      ? "1px solid rgba(0,212,255,0.25)"
                      : "1px solid rgba(0,100,200,0.25)"
                    : isDark
                    ? "1px solid rgba(0,212,255,0.08)"
                    : "1px solid rgba(0,100,200,0.08)",
                  boxShadow: email.unread
                    ? isDark
                      ? "0 2px 15px rgba(0,212,255,0.08)"
                      : "0 2px 15px rgba(0,100,200,0.06)"
                    : "0 1px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, #00d4ff, #a855f7)"
                        : "linear-gradient(135deg, #0082b4, #7c3aed)",
                      color: "#ffffff",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {email.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-sm"
                        onClick={() => navigate(`/readmail/${email.id}`)}
                        style={{
                          fontWeight: email.unread ? 700 : 500,
                          color: isDark ? "#e2eeff" : "#0a1628",
                            cursor: "pointer",
                          }}
                      >
                        {email.sender}
                      </span>
                      {email.hasAttachment && (
                        <Paperclip
                          className="w-3 h-3"
                          style={{ color: isDark ? "rgba(226,238,255,0.4)" : "rgba(10,22,40,0.4)" }}
                        />
                      )}
                    </div>
                    <p
                      className="text-sm mb-1.5"
                      style={{
                        fontWeight: email.unread ? 600 : 400,
                        color: isDark ? "#e2eeff" : "#0a1628",
                      }}
                    >
                      {email.subject}
                    </p>
                    {/* <p
                      className="text-xs truncate"
                      style={{
                        color: isDark ? "rgba(226,238,255,0.5)" : "rgba(10,22,40,0.5)",
                      }}
                    >
                      {email.preview}
                    </p> */}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">

  <span
    className="text-xs"
    style={{
      fontFamily: "JetBrains Mono, monospace",
      color: isDark
        ? "rgba(226,238,255,0.45)"
        : "rgba(10,22,40,0.45)",
    }}
  >
    {email.time}
  </span>

  <button
    onClick={() => toggleStar(email.id)}
    className="transition-all duration-200 hover:scale-110"
    style={{
      color: email.is_starred
        ? isDark
          ? "#ffaa00"
          : "#ff8800"
        : isDark
        ? "rgba(226,238,255,0.25)"
        : "rgba(10,22,40,0.25)",
    }}
  >
    <Star
      className="w-4 h-4"
      fill={email.is_starred ? "currentColor" : "none"}
    />
  </button>

  <button
    onClick={async () => {

      try {

        const token = localStorage.getItem("access");

        await fetch(
          `http://127.0.0.1:8000/delete-mail/${email.id}/`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fetchEmails();

      } catch (error) {

        console.log(error);
      }
    }}
    // className="transition-all duration-200 hover:scale-110"
    // style={{
    //   color: "#ff4d4f",
    // }}
  >
    {/* <Trash2 className="w-4 h-4" /> */}
  </button>

</div>
                </div>
              </div>
            ))}
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
    </div>
  );
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(!isDark) }}>
      <DashboardContent />
    </ThemeContext.Provider>
  );
}
