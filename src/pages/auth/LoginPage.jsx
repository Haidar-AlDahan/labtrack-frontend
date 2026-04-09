import { useNavigate } from "react-router-dom";
import { useState } from "react";
function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [signInData, setSignInData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const isKfupmEmail = (email) => {
    return /^[^\s@]+@kfupm\.edu\.sa$/.test(email);
  };

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleSignIn = () => {
    const newErrors = {};

    if (!isKfupmEmail(signInData.identifier)) {
      newErrors.identifier = "Enter a valid KFUPM email.";
    }

    if (!isStrongPassword(signInData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
    }

    setErrors(newErrors);
    setSuccessMessage("");

    if (Object.keys(newErrors).length === 0) {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const user = users.find(
        (u) =>
          u.email === signInData.identifier &&
          u.password === signInData.password,
      );

      if (!user) {
        setErrors({ identifier: "Invalid email or password." });
        return;  
      }
       localStorage.setItem("currentUser", JSON.stringify(user));

      if (user.role === "instructor") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    }
  };
  const handleRegister = () => {
    const newErrors = {};

    if (!registerData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!isKfupmEmail(registerData.email)) {
      newErrors.email = "Enter a valid KFUPM email.";
    }

    if (!isStrongPassword(registerData.password)) {
      newErrors.registerPassword =
        "Password must be at least 8 characters and include upStudent percase, lowercase, and a number.";
    }

    if (registerData.confirmPassword !== registerData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      users.push({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      });

      localStorage.setItem("users", JSON.stringify(users));
      setSuccessMessage("Registration successful. You can now sign in.");
      setActiveTab("signin");
      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      });
      setErrors({});
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b18] text-white">
      <div className="w-full max-w-md rounded-xl bg-[#0b1424] p-8 shadow-lg">
        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-cyan-400">
          LabTrack
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Collaborative Programming Platform
        </p>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-[#0f1b33] p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrors({});
              setSuccessMessage("");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              activeTab === "signin"
                ? "bg-cyan-500 text-white"
                : "text-gray-400"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrors({});
              setSuccessMessage("");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              activeTab === "register"
                ? "bg-cyan-500 text-white"
                : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>
        {successMessage && (
          <p className="mb-4 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-400">
            {successMessage}
          </p>
        )}

        {/* Form */}
        {activeTab === "signin" ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="KFUPM Email"
                value={signInData.identifier}
                onChange={(e) =>
                  setSignInData({
                    ...signInData,
                    identifier: e.target.value,
                  })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-400">{errors.identifier}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={signInData.rememberMe}
                  onChange={(e) =>
                    setSignInData({
                      ...signInData,
                      rememberMe: e.target.checked,
                    })
                  }
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset is not implemented in this prototype yet.",
                  )
                }
                className="text-cyan-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              className="w-full rounded-md bg-cyan-500 py-3 font-semibold hover:bg-cyan-600"
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={registerData.fullName}
                onChange={(e) =>
                  setRegisterData({ ...registerData, fullName: e.target.value })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="KFUPM Email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.registerPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.registerPassword}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-400">Account Type</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRegisterData({ ...registerData, role: "student" })
                  }
                  className={`flex-1 rounded-md py-2 text-sm ${
                    registerData.role === "student"
                      ? "bg-cyan-500 text-white"
                      : "bg-[#0f1b33] text-gray-400"
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRegisterData({ ...registerData, role: "instructor" })
                  }
                  className={`flex-1 rounded-md py-2 text-sm ${
                    registerData.role === "instructor"
                      ? "bg-cyan-500 text-white"
                      : "bg-[#0f1b33] text-gray-400"
                  }`}
                >
                  Instructor
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegister}
              className="w-full rounded-md bg-cyan-500 py-3 font-semibold hover:bg-cyan-600"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
