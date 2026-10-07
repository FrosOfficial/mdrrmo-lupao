import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { DEMO_USERS } from "../data/mock-data";

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { login, switchUser } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setError("");
      onLoginSuccess();
    } else {
      setError("Invalid username or password. You may use any demo account below.");
    }
  };

  const handleQuickLogin = (uname: string) => {
    switchUser(uname);
    onLoginSuccess();
  };

  return (
    <div className="login-page-container">
      <div className="login-backdrop-glow" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <Logo />
            <div>
              <strong>MDRRMO LUPAO</strong>
              <span>NUEVA ECIJA · REGION III</span>
            </div>
          </div>
          <h2>Disaster Management & Relief System</h2>
          <p>
            Secure access portal for municipal personnel, field responders, and barangay officials.
          </p>
        </div>

        <div className="login-status-chip">
          <span className="pulse" />
          <div>
            <small>LUPAO EMERGENCY PREPAREDNESS</small>
            <strong>Elevated Readiness Phase</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-alert">{error}</div>}

          <label>
            <span>Username or Email</span>
            <div className="input-with-icon">
              <Icon name="users" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-with-icon">
              <Icon name="shield" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </label>

          <button type="submit" className="primary-button login-submit-btn">
            Sign In to System
            <Icon name="arrow" size={16} />
          </button>
        </form>

        <div className="demo-accounts-section">
          <div className="demo-header-label">
            <span>ONE-CLICK DEMO ACCOUNTS (ROLE BASED)</span>
          </div>
          <div className="demo-accounts-grid">
            {DEMO_USERS.map((u) => (
              <button
                key={u.username}
                type="button"
                className="demo-account-chip"
                onClick={() => handleQuickLogin(u.username)}
              >
                <div className="demo-chip-top">
                  <strong>{u.fullName}</strong>
                  <span className="demo-badge">{u.username}</span>
                </div>
                <small>{u.role}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer-info">
          <div className="form-note">
            <Icon name="cloud" size={16} />
            <span>Local-first architecture enabled. Offline synchronization active.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
