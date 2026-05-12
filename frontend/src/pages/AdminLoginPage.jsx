import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";
import { adminLogin } from "../lib/authApi";

export default function AdminLoginPage() {
  const usernameRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const token = await adminLogin(username, password);
      login(token);
      navigate("/admin");
    } catch (error) {
      setErrorMessage(error.message || "Login failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="section admin-auth-section">
      <div className="container">
        <div className="admin-auth-grid">
          <div className="admin-auth-copy animate-fade-in">
            <p className="eyebrow">Backend connected</p>
            <h1>Secure Admin Login</h1>
            <p className="hero-copy">
              Enter your user ID and password to sign in. This form sends your credentials to the
              backend login API and redirects you to the admin panel after successful verification.
            </p>

            <div className="auth-highlights">
              <div className="auth-highlight-card">
                <strong>Live auth</strong>
                <span>Verifies against backend admin users</span>
              </div>
              <div className="auth-highlight-card">
                <strong>Fast redirect</strong>
                <span>Login success opens admin dashboard instantly</span>
              </div>
              <div className="auth-highlight-card">
                <strong>Secure token</strong>
                <span>Token stored locally for admin sessions</span>
              </div>
            </div>
          </div>

          <div className="glass-card admin-auth-card animate-scale-in">
            <div className="admin-auth-badge">Admin Access</div>
            <h2>Sign in to continue</h2>
            <p className="small-muted">Use your admin credentials to unlock course management.</p>

            <form onSubmit={onSubmit} className="admin-auth-form">
              <label className="auth-field">
                <span>User ID</span>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter user ID"
                  autoComplete="username"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </label>

              <button type="submit" className="btn btn-primary full" disabled={isProcessing}>
                {isProcessing ? "Logging in..." : "Login to Admin"}
              </button>
            </form>

            {errorMessage ? <p className="error-note auth-error">{errorMessage}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
