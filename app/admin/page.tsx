"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch data");
      setRegistrations(data.registrations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple basic protection for urgent setup (Ideally this is session-based API route)
    if (password === "TACyouth2024") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid admin password");
    }
  };

  if (!isAuthenticated) {
    return (
      <main
        className="container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="glass-card slide-up"
          style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Admin Access</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Login
            </button>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              Default pass: TACyouth2024
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main
      className="container"
      style={{ padding: "4rem 1.5rem", minHeight: "100vh" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            className="text-gradient"
            style={{
              fontSize: "2.5rem",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Users size={36} color="var(--primary)" />
            Registrations
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage youth convocation attendees and payment proofs
          </p>
        </div>

        <button
          onClick={fetchRegistrations}
          className="btn btn-secondary"
          style={{ padding: "0.5rem 1rem" }}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="glass-card slide-up" style={{ padding: "1.5rem" }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem",
            }}
          >
            <Loader2
              size={32}
              className="text-accent-gradient"
              style={{
                animation: "spin 1s linear infinite",
                marginBottom: "1rem",
              }}
            />
            <p style={{ color: "var(--text-muted)" }}>Loading records...</p>
          </div>
        ) : error ? (
          <div
            style={{ color: "#ff4d6d", padding: "2rem", textAlign: "center" }}
          >
            {error}
          </div>
        ) : registrations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-muted)",
            }}
          >
            No registrations yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    color: "var(--text-muted)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "1rem" }}>Code</th>
                  <th style={{ padding: "1rem" }}>Name</th>
                  <th style={{ padding: "1rem" }}>Contact</th>
                  <th style={{ padding: "1rem" }}>Bank Detail</th>
                  <th style={{ padding: "1rem" }}>Date</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Proof</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg: any) => (
                  <tr
                    key={reg._id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        fontWeight: 600,
                        color: "var(--primary-hover)",
                      }}
                    >
                      {reg.registrationCode}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600 }}>{reg.name}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {reg.gender} • {reg.area}
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div>{reg.phone}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {reg.email}
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div>{reg.paymentName}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {reg.paymentBank}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <a
                        href={reg.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                          borderRadius: "8px",
                        }}
                      >
                        View Receipt <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `,
        }}
      />
    </main>
  );
}
