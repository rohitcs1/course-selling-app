import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";
import { adminLogin as adminLoginRequest, adminLogout } from "../lib/authApi";

const navItems = [
  { label: "Courses", to: "/" },
  { label: "My Learning", to: "/dashboard" },
  { label: "Contact", to: "/contact" },
  { label: "About", to: "/about" }
];

export default function Navbar() {
  const { adminToken, login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const loginCardRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }

      if (loginCardRef.current && !loginCardRef.current.contains(event.target)) {
        setIsLoginOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (adminToken) {
      setIsLoginOpen(false);
    }
  }, [adminToken]);

  const onLogout = async () => {
    try {
      if (adminToken) {
        await adminLogout(adminToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/");
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const onLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const token = await adminLoginRequest(loginForm.username, loginForm.password);
      login(token);
      setLoginForm({ username: "", password: "" });
      setIsLoginOpen(false);
      navigate("/admin");
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <NavLink to="/" className="brand">
          CourseNest
        </NavLink>

        <nav className="nav-links nav-links-desktop" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="nav-login-wrap" ref={loginCardRef}>
            <button
              type="button"
              className="nav-item nav-trigger"
              aria-expanded={isLoginOpen}
              onClick={() => setIsLoginOpen((prev) => !prev)}
            >
              Admin Login
            </button>

            {isLoginOpen && !adminToken ? (
              <div className="login-card" role="dialog" aria-label="Admin login form">
                <div className="login-card-head">
                  <strong>Admin Login</strong>
                  <p>Sign in to manage courses.</p>
                </div>

                <form className="login-form" onSubmit={onLoginSubmit}>
                  <label className="login-field">
                    <span>Username</span>
                    <input
                      type="text"
                      name="username"
                      value={loginForm.username}
                      onChange={onLoginChange}
                      placeholder="Enter username"
                      autoComplete="username"
                      required
                    />
                  </label>

                  <label className="login-field">
                    <span>Password</span>
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={onLoginChange}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  {loginError ? <p className="login-error">{loginError}</p> : null}

                  <button type="submit" className="btn btn-primary full" disabled={isLoggingIn}>
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="login-card-footer">
                  <Link to="/admin-login" className="login-link" onClick={() => setIsLoginOpen(false)}>
                    Open full login page
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          {adminToken && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              >
                Admin Panel
              </NavLink>
              <button type="button" className="nav-item nav-logout" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </nav>

        <div className="nav-actions" ref={menuRef}>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          {isMenuOpen ? (
            <div className="menu-dropdown">
              <NavLink to="/admin-login" className="menu-link" onClick={closeMenu}>
                Admin Login
              </NavLink>
              {adminToken ? (
                <>
                  <NavLink to="/admin" className="menu-link" onClick={closeMenu}>
                    Admin Panel
                  </NavLink>
                  <button type="button" className="menu-link menu-button" onClick={onLogout}>
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="container mobile-quick-links" aria-label="Quick navigation">
        <NavLink to="/" className={({ isActive }) => (isActive ? "mobile-pill active" : "mobile-pill")}>
          Courses
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "mobile-pill active" : "mobile-pill")}
        >
          My Learning
        </NavLink>
      </div>
    </header>
  );
}
