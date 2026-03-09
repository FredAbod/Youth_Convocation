"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ExternalLink, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      
      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === id ? { ...reg, status } : reg
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" },
      approved: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
      rejected: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "capitalize",
          background: style.bg,
          color: style.color,
        }}
      >
        {status || "pending"}
      </span>
    );
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
          <div style={{ marginBottom: "1.5rem" }}>
            <Image
              src="/taclogo.jpeg"
              alt="TAC Logo"
              width={60}
              height={60}
              style={{ borderRadius: "12px", objectFit: "cover", margin: "0 auto" }}
            />
          </div>
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
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="container"
        style={{ padding: "4rem 1.5rem", minHeight: "100vh" }}
      >
        <div
          className="admin-header"
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
              <Image
                src="/taclogo.jpeg"
                alt="TAC Logo"
                width={40}
                height={40}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
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

        <div className="glass-card slide-up admin-table-container" style={{ padding: "1.5rem" }}>
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
                    <th style={{ padding: "1rem" }}>Status</th>
                    <th style={{ padding: "1rem" }}>Date</th>
                    <th style={{ padding: "1rem" }}>Proof</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
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
                      <td style={{ padding: "1rem" }}>
                        {getStatusBadge(reg.status)}
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
                      <td style={{ padding: "1rem" }}>
                        <a
                          href={reg.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                          }}
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {reg.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(reg._id, "approved")}
                              disabled={updatingId === reg._id}
                              className="btn"
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#10b981",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                              title="Approve receipt"
                            >
                              {updatingId === reg._id ? (
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                            </button>
                          )}
                          {reg.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(reg._id, "rejected")}
                              disabled={updatingId === reg._id}
                              className="btn"
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              }}
                              title="Reject receipt"
                            >
                              {updatingId === reg._id ? (
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                              ) : (
                                <XCircle size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Image
                src="/tacsublogo.jpeg"
                alt="TAC Sub Logo"
                width={50}
                height={50}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
              <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                The Apostolic Church
              </span>
            </div>
            <p className="footer-credit">
              This app was built by{" "}
              <a
                href="https://github.com/FredAbod"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fredabod Technologies
              </a>
            </p>
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `,
        }}
      />
    </>
  );
}
