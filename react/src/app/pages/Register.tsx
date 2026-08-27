import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
  UserPlus,
} from "lucide-react";
import {
  FormInput,
  GradButton,
  glassCardStyle,
} from "../components/FormElements";

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Separate error for every field
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Show password requirements only after Submit
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  const navigate = useNavigate();

  const eyeBtn = (visible: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="opacity-50 hover:opacity-75 transition-opacity"
      style={{ color: "#7A6D63" }}
    >
      {visible ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );

  // ----------------------------------------
  // PASSWORD REQUIREMENT CHECKS
  // ----------------------------------------

  const passwordChecks = {
    minLength: password.length >= 8,

    uppercase: /[A-Z]/.test(password),

    lowercase: /[a-z]/.test(password),

    number: /[0-9]/.test(password),

    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),

    noNameOrEmail:
      !name ||
      !password.toLowerCase().includes(name.toLowerCase()) &&
        !password.toLowerCase().includes(email.toLowerCase()),
  };

  const handleRegister = async () => {
    // ----------------------------------------
    // START WITH EMPTY ERRORS
    // ----------------------------------------

    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    // ----------------------------------------
    // NAME VALIDATION
    // ----------------------------------------

    if (!name.trim()) {
      newErrors.name = "Fullname is Required";
    } else if (!/^[A-Za-z ]+$/.test(name)) {
      // Only alphabets and spaces
      newErrors.name =
        "Name must contain only alphabets";
    } else if (name.length > 20) {
      // Length checked only if characters are valid
      newErrors.name =
        "Name must not exceed 20 characters";
    }

    // ----------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------

    if (!email.trim()) {
      newErrors.email = "Email is Required";
    } else if (!email.toLowerCase().endsWith("@qumail.io")) {
      newErrors.email =
        "Email must end with '@qumail.io'";
    }

    // ----------------------------------------
    // PHONE VALIDATION
    // ----------------------------------------

    if (!phone.trim()) {
      newErrors.phone = "Phone number is Required";
    } else if (!/^\d+$/.test(phone)) {
      newErrors.phone =
        "Phone number must contain only digits";
    } else if (phone.length !== 10) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits";
    }

    // ----------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------

    if (!password) {
      newErrors.password = "Password is Required";

      setShowPasswordRequirements(false);
    } else {
      // Show all password requirements
      setShowPasswordRequirements(true);

      const passwordValid =
        passwordChecks.minLength &&
        passwordChecks.uppercase &&
        passwordChecks.lowercase &&
        passwordChecks.number &&
        passwordChecks.special &&
        passwordChecks.noNameOrEmail;

      if (!passwordValid) {
        newErrors.password =
          "Password requirements not satisfied";
      }
    }

    // ----------------------------------------
    // CONFIRM PASSWORD VALIDATION
    // ----------------------------------------

    if (!confirmPassword) {
      newErrors.confirmPassword = "Required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    // ----------------------------------------
    // DISPLAY ALL ERRORS
    // ----------------------------------------

    setErrors(newErrors);

    // If ANY field has an error,
    // don't send request to backend
    if (
      Object.values(newErrors).some(
        (error) => error !== ""
      )
    ) {
      return;
    }

    // ----------------------------------------
    // SEND DATA TO BACKEND
    // ----------------------------------------

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            confirm_password: confirmPassword,
            phone_number: phone,
          }),
        }
      );

      const data = await response.json();

      // ----------------------------------------
      // BACKEND ERROR
      // ----------------------------------------

      if (!response.ok) {
        const backendError =
          data.error || "Registration failed";

        const errorText =
          backendError.toLowerCase();

        if (errorText.includes("email")) {
          setErrors((prev) => ({
            ...prev,
            email: backendError,
          }));
        } else if (errorText.includes("phone")) {
          setErrors((prev) => ({
            ...prev,
            phone: backendError,
          }));
        } else if (errorText.includes("password")) {
          setErrors((prev) => ({
            ...prev,
            password: backendError,
          }));
        } else if (errorText.includes("name")) {
          setErrors((prev) => ({
            ...prev,
            name: backendError,
          }));
        } else if (
          errorText.includes("required")
        ) {
          setErrors((prev) => ({
            ...prev,
            name: !name ? "Required" : prev.name,
            email: !email ? "Required" : prev.email,
            phone: !phone ? "Required" : prev.phone,
            password: !password
              ? "Required"
              : prev.password,
            confirmPassword: !confirmPassword
              ? "Required"
              : prev.confirmPassword,
          }));
        }

        return;
      }

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      navigate("/login");
    } catch (err) {
      console.error(err);

      setErrors((prev) => ({
        ...prev,
        email: "Server error",
      }));
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
          background:
            "radial-gradient(circle, rgba(184,155,94,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md py-14">

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={glassCardStyle(false)}
        >

          {/* Card Header */}
          <div
            className="px-8 pt-8 pb-6"
            style={{
              borderBottom: "1px solid #E6DDD2",
            }}
          >

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background:
                  "rgba(184,155,94,0.12)",
                border:
                  "1px solid rgba(184,155,94,0.35)",
              }}
            >
              <UserPlus
                className="w-5 h-5"
                style={{
                  color: "#B89B5E",
                }}
              />
            </div>

            <h1
              className="font-bold mb-1.5"
              style={{
                fontFamily:
                  "Orbitron, sans-serif",
                fontSize: "1.05rem",
                color: "#3B2A23",
              }}
            >
              Create Your Quantum Vault
            </h1>

            <p
              className="text-xs leading-relaxed"
              style={{
                color: "#7A6D63",
              }}
            >
              Join thousands securing their digital
              communications with quantum-grade
              encryption.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-3.5">

            {/* -------------------------------- */}
            {/* NAME */}
            {/* -------------------------------- */}

            <div>
              <FormInput
                label="Full Name"
                type="text"
                placeholder="Aiden Mercer"
                icon={
                  <User className="w-4 h-4" />
                }
                isDark={false}
                value={name}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^[A-Za-z ]*$/.test(value)) {
                    setName(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    !/[A-Za-z ]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight"
                  ) {
                    e.preventDefault();
                  }
                }}
              />

              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* -------------------------------- */}
            {/* EMAIL */}
            {/* -------------------------------- */}

            <div>
              <FormInput
                label="Create Email Address"
                type="email"
                placeholder="aiden@qumail.io"
                icon={
                  <Mail className="w-4 h-4" />
                }
                isDark={false}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* -------------------------------- */}
            {/* PHONE */}
            {/* -------------------------------- */}

            <div>
              <FormInput
                label="Mobile Number"
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                icon={
                  <Phone className="w-4 h-4" />
                }
                isDark={false}
                value={phone}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d*$/.test(value)) {
                    setPhone(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight"
                  ) {
                    e.preventDefault();
                  }
                }}
              />

              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* -------------------------------- */}
            {/* PASSWORD */}
            {/* -------------------------------- */}

            <div>
              <FormInput
                label="Password"
                type={
                  showPass
                    ? "text"
                    : "password"
                }
                placeholder="••••••••••••"
                icon={
                  <Lock className="w-4 h-4" />
                }
                isDark={false}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                rightEl={eyeBtn(
                  showPass,
                  () =>
                    setShowPass(!showPass)
                )}
              />

              {/* Password Required */}
              {errors.password === "Required" && (
                <p className="text-red-500 text-xs mt-1">
                  Required
                </p>
              )}

              {/* Password Requirements */}
              {showPasswordRequirements &&
                password &&
                errors.password !== "Required" && (
                  <div className="mt-2 space-y-1">

                    <p className="text-red-500 text-xs mb-1">
                      Password must contain:
                    </p>

                    {/* Minimum Length */}
                    <p
                      className={
                        passwordChecks.minLength
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.minLength
                        ? "✓"
                        : "✗"}{" "}
                      At least 8 characters
                    </p>

                    {/* Uppercase */}
                    <p
                      className={
                        passwordChecks.uppercase
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.uppercase
                        ? "✓"
                        : "✗"}{" "}
                      One uppercase letter
                    </p>

                    {/* Lowercase */}
                    <p
                      className={
                        passwordChecks.lowercase
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.lowercase
                        ? "✓"
                        : "✗"}{" "}
                      One lowercase letter
                    </p>

                    {/* Number */}
                    <p
                      className={
                        passwordChecks.number
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.number
                        ? "✓"
                        : "✗"}{" "}
                      One number
                    </p>

                    {/* Special Character */}
                    <p
                      className={
                        passwordChecks.special
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.special
                        ? "✓"
                        : "✗"}{" "}
                      One special character
                    </p>

                    {/* Name / Email */}
                    <p
                      className={
                        passwordChecks.noNameOrEmail
                          ? "text-green-600 text-xs"
                          : "text-red-500 text-xs"
                      }
                    >
                      {passwordChecks.noNameOrEmail
                        ? "✓"
                        : "✗"}{" "}
                      Must not contain your
                      name or email
                    </p>

                  </div>
                )}
            </div>

            {/* -------------------------------- */}
            {/* CONFIRM PASSWORD */}
            {/* -------------------------------- */}

            <div>
              <FormInput
                label="Confirm Password"
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="••••••••••••"
                icon={
                  <Shield className="w-4 h-4" />
                }
                isDark={false}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                rightEl={eyeBtn(
                  showConfirm,
                  () =>
                    setShowConfirm(
                      !showConfirm
                    )
                )}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* -------------------------------- */}
            {/* REGISTER BUTTON */}
            {/* -------------------------------- */}

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

            {/* Login */}
            <p
              className="text-center text-xs"
              style={{
                color: "#7A6D63",
              }}
            >
              Already secured?{" "}
              <Link
                to="/login"
                className="underline hover:opacity-80 transition-opacity"
                style={{
                  color: "#B89B5E",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* -------------------------------- */}
          {/* FOOTER */}
          {/* -------------------------------- */}

          <div
            className="px-8 py-3 flex items-center gap-2 justify-center"
            style={{
              borderTop:
                "1px solid #E6DDD2",
              background:
                "rgba(184,155,94,0.025)",
            }}
          >
            <Shield
              className="w-3 h-3"
              style={{
                color: "#A89B91",
                opacity: 0.6,
              }}
            />

            <span
              className="text-xs"
              style={{
                fontFamily:
                  "JetBrains Mono, monospace",
                color: "#A89B91",
              }}
            >
              TLS 1.3 · CRYSTALS-Kyber ·
              CRYSTALS-Dilithium
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}