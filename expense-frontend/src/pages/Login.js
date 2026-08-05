import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(`http://localhost:8082${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // ✅ Always read as text first — backend returns plain token string
      const text = await res.text();

      if (!res.ok) {
        setError(text || "Something went wrong");
        setLoading(false);
        return;
      }

      if (isRegister) {
        setError("");
        setIsRegister(false);
        setLoading(false);
        alert("Registered successfully! Please login.");
        return;
      }

      // ✅ text IS the token — store it directly
      localStorage.setItem("token", text.trim());
      window.location.href = "/dashboard";

    } catch (err) {
      setError("Server error. Make sure backend is running.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .login-bg {
          min-height: 100vh;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse at 20% 30%, rgba(249,115,22,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.07) 0%, transparent 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }
        .login-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
        }
        .login-logo {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f0ece4;
          margin-bottom: 6px;
          text-align: center;
        }
        .login-logo span { color: #f97316; }
        .login-sub {
          text-align: center;
          color: rgba(240,236,228,0.4);
          font-size: 14px;
          margin-bottom: 36px;
        }
        .login-label {
          font-size: 12px;
          color: rgba(240,236,228,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
          display: block;
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #f0ece4;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 18px;
        }
        .login-input:focus { border-color: #f97316; }
        .login-input::placeholder { color: rgba(240,236,228,0.2); }
        .login-btn {
          width: 100%;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .login-btn:hover { background: #ea6c10; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .login-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 16px;
          text-align: center;
        }
        .login-toggle {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: rgba(240,236,228,0.35);
        }
        .login-toggle span {
          color: #f97316;
          cursor: pointer;
          font-weight: 500;
        }
        .login-toggle span:hover { text-decoration: underline; }
      `}</style>

      <div className="login-bg">
        <div className="login-box">
          <div className="login-logo">expense<span>.</span>track</div>
          <div className="login-sub">
            {isRegister ? "Create your account" : "Sign in to manage your finances"}
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create Account →" : "Sign In →"}
            </button>
          </form>

          <div className="login-toggle">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
              {isRegister ? "Sign in" : "Register here"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;





// import React, { useState } from "react";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {

// const res = await fetch("http://localhost:8081/api/auth/login", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({ email, password }),
// });


//       if (!res.ok) {
//         throw new Error("Login failed");
//       }

//       const data = await res.json();

//       // 🔥 Store token securely
//       localStorage.setItem("token", data.token);

//       console.log("TOKEN SAVED:", data.token);
//       alert("Login successful");

//       // Redirect to dashboard
//       window.location.href = "/dashboard";
//     } catch (err) {
//       console.error(err);
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <br />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <br />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }