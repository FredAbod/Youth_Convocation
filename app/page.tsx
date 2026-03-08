"use client";

import { useState } from "react";
import {
  UploadCloud,
  CheckCircle,
  Ticket,
  Download,
  ArrowRight,
  Building2,
  MapPin,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    area: "",
    phone: "",
    email: "",
    paymentName: "",
    paymentBank: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successCode, setSuccessCode] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload your payment proof (EOP).");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append("paymentProof", file);

      const res = await fetch("/api/register", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to register.");
      }

      setSuccessCode(result.registrationCode);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (successCode) {
    return (
      <main
        className="container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
        }}
      >
        <div
          className="glass-card slide-up"
          style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}
        >
          <div
            className="no-print"
            style={{
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={40} color="#10b981" />
            </div>
          </div>

          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
          >
            Registration Successful!
          </h1>
          <p
            style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}
            className="no-print"
          >
            Your payment proof has been uploaded. Please save your ticket below
            for onsite registration.
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px dashed var(--glass-border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              margin: "2rem 0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "5px",
                height: "100%",
                background: "var(--accent)",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "1.5rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  The Apostolic Church
                </h3>
                <p
                  style={{
                    color: "var(--accent)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Youth Convocation
                </p>
              </div>
              <Ticket size={32} color="var(--accent)" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                textAlign: "left",
                marginBottom: "2rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.2rem",
                  }}
                >
                  Name
                </p>
                <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                  {formData.name}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.2rem",
                  }}
                >
                  Area
                </p>
                <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                  {formData.area}
                </p>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "1.5rem",
                borderRadius: "12px",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Registration Code
              </p>
              <p
                className="text-accent-gradient"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  letterSpacing: "2px",
                  margin: 0,
                }}
              >
                {successCode}
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="btn btn-primary no-print"
            style={{ width: "100%", padding: "1rem" }}
          >
            <Download size={20} />
            Save Ticket as PDF
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Navbar */}
      <nav className="navbar">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="brand">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, var(--accent) 0%, #ff4d6d 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: "18px" }}>TAC</span>
            </div>
            <span className="text-gradient">Youth Convocation</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{ paddingTop: "140px", paddingBottom: "60px" }}
        className="fade-in"
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div style={{ maxWidth: "600px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: "rgba(225, 29, 72, 0.1)",
                  border: "1px solid rgba(225, 29, 72, 0.2)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--accent)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                Registration Now Open
              </div>
              <h1
                className="text-gradient"
                style={{ fontSize: "4rem", marginBottom: "1.5rem" }}
              >
                One Fold,
                <br />
                One Shepherd.
              </h1>
              <p
                style={{
                  fontSize: "1.125rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                }}
              >
                Join us for a transformative experience at the Apostolic Church
                Youth Convocation. Secure your spot now and be part of this
                divine gathering. Let no man despise thy youth.
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <a href="#register" className="btn btn-primary">
                  Register Now
                  <ArrowRight size={18} />
                </a>
              </div>

              {/* Account Details Box */}
              <div
                style={{
                  marginTop: "3rem",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Building2 size={16} color="var(--accent)" />
                    Registration Fee
                  </p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                    ₦500
                  </p>
                </div>
                <div
                  style={{ width: "1px", background: "var(--glass-border)" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    Payment Details
                  </p>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: "0.9rem" }}>
                    The Apostolic Church Nig. Abeokuta Metro Youth
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    1311676175 - ZENITH BANK
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div
              id="register"
              className="glass-card slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                Secure your participation
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "2rem",
                }}
              >
                Fill this form carefully. After completing payment, upload your
                proof to receive your Registration Code.
              </p>

              {error && (
                <div
                  style={{
                    background: "rgba(225, 29, 72, 0.1)",
                    border: "1px solid var(--accent)",
                    color: "#ff4d6d",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "1.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <h3
                  style={{
                    fontSize: "1rem",
                    color: "var(--accent)",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Personal Information
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Area</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="E.g., Abeokuta"
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="08012345678"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "1rem",
                    color: "var(--accent)",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Payment Confirmation
                </h3>

                <div className="form-group">
                  <label className="form-label">Name used for Payment</label>
                  <input
                    type="text"
                    name="paymentName"
                    value={formData.paymentName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="E.g., John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bank used for Payment</label>
                  <input
                    type="text"
                    name="paymentBank"
                    value={formData.paymentBank}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="E.g., GTBank"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Upload Evidence of Payment (EOP)
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-upload-input"
                      required
                    />
                    <div className="file-upload-content">
                      <UploadCloud size={32} className="file-upload-icon" />
                      <span
                        style={{
                          fontWeight: 500,
                          color: file ? "white" : "var(--text-muted)",
                        }}
                      >
                        {file ? file.name : "Click or drag receipt here"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "1rem" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Processing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

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
