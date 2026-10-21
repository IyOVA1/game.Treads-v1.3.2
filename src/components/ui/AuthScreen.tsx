import { useState } from "react";
import { useAccountStore } from "../../store/accountStore";
import { useTankStore } from "../../store/tankStore";
import "./AuthScreen.css";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError, login, register, continueAsGuest } = useAccountStore();
  const hydrate = useTankStore((s) => s.hydrateFromAccount);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = mode === "login" ? login(username, password) : register(username, password);
    if (ok) hydrate();
  };

  const guest = () => {
    continueAsGuest();
    hydrate();
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Treads</h1>
        <p className="tagline">Modular tank combat</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-primary">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button type="button" className="auth-guest" onClick={guest}>
          Continue as guest
        </button>

        <p className="auth-note">
          Accounts are stored on this device for now. Progress saves automatically.
          Cloud sync can plug into the same system later (mobile-ready).
        </p>
      </div>
    </div>
  );
}
