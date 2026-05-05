import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  // 🔐 Auto redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  // 🔐 Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("token", "rass-demo-token");
      localStorage.setItem("role", role);
      localStorage.setItem("username", username); // ✅ STORE USERNAME

      setLoading(false);
      navigate("/admin/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070B14] text-white">

      <div className="absolute w-[600px] h-[600px] bg-purple-600/25 blur-[140px] rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/25 blur-[140px] rounded-full bottom-[-150px] right-[-150px]" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] top-[40%] left-[50%]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-[400px] p-9 rounded-[28px]
        bg-white/5 backdrop-blur-3xl
        border border-white/10
        shadow-[0_0_80px_rgba(0,0,0,0.7)]"
      >

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-wide">
            RASS Academy
          </h1>
          <p className="text-sm text-white/50 mt-2">
            Secure Admin Access Portal
          </p>
        </div>

        <div className="relative flex p-1 mb-7 rounded-xl bg-white/5 border border-white/10">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500
            ${role === "admin" ? "left-1" : "left-1/2"}`}
          />

          <button
            type="button"
            onClick={() => setRole("admin")}
            className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm"
          >
            <Shield size={16} />
            Admin
          </button>

          <button
            type="button"
            onClick={() => setRole("staff")}
            className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm"
          >
            <User size={16} />
            Staff
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Username */}
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)} // ✅ CAPTURE USERNAME
              className="peer w-full px-4 pt-5 pb-2 rounded-xl
              bg-white/5 border border-white/10
              outline-none focus:border-purple-400 transition"
            />
            <label className="absolute left-4 top-3 text-white/40 text-sm
              transition-all
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-purple-400
              peer-valid:top-1 peer-valid:text-xs">
              Username
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              required
              className="peer w-full px-4 pt-5 pb-2 rounded-xl
              bg-white/5 border border-white/10
              outline-none focus:border-blue-400 transition"
            />
            <label className="absolute left-4 top-3 text-white/40 text-sm
              transition-all
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400">
              Password
            </label>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium
            bg-gradient-to-r from-purple-500 to-blue-500
            shadow-[0_0_30px_rgba(99,102,241,0.3)]
            hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]
            transition-all disabled:opacity-60"
          >
            {loading ? "Signing in..." : `Continue as ${role}`}
          </motion.button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          © 2026 RASS Academy • All rights reserved
        </p>

      </motion.div>
    </div>
  );
}