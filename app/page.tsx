"use client";

import { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  CheckCircle,
  Ticket,
  Download,
  ArrowRight,
  Building2,
  MapPin,
  Loader2,
  ImageIcon,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";

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

  // Flier states
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [generatedFlier, setGeneratedFlier] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

  // Handle user photo upload for flier
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhoto(event.target?.result as string);
        setGeneratedFlier(null);
        // Reset crop states
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback when crop is complete
  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Helper to create cropped image
  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  // Generate the flier with user photo
  const generateFlier = async () => {
    if (!userPhoto || !canvasRef.current || !croppedAreaPixels) return;

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Load the flier template
      const template = new window.Image();
      template.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        template.onload = () => resolve();
        template.onerror = reject;
        template.src = "/flier-template.png";
      });

      // Set canvas dimensions to match template
      canvas.width = template.width;
      canvas.height = template.height;

      // Get the cropped user photo
      const croppedImageSrc = await getCroppedImg(userPhoto, croppedAreaPixels);
      
      // Load cropped user photo
      const userImg = new window.Image();
      userImg.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        userImg.onload = () => resolve();
        userImg.onerror = reject;
        userImg.src = croppedImageSrc;
      });

      // Position for the photo frame area - EXACT measurements from template (1432x1354)
      const frameX = canvas.width * 0.372;  // 533px / 1432px
      const frameY = canvas.height * 0.46;  // Moved down more
      const frameWidth = canvas.width * 0.258;  // 370px / 1432px
      const frameHeight = canvas.height * 0.28; // Reduced height to fit frame

      // First draw the template
      ctx.drawImage(template, 0, 0);

      // Then draw the cropped user photo in the frame area (it's already cropped to aspect ratio)
      ctx.drawImage(userImg, frameX, frameY, frameWidth, frameHeight);

      // Generate the final image
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      setGeneratedFlier(dataUrl);
    } catch (err) {
      console.error("Error generating flier:", err);
      alert("Failed to generate flier. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download the generated flier
  const downloadFlier = () => {
    if (!generatedFlier) return;
    const link = document.createElement("a");
    link.download = `TAC-Youth-Convocation-${formData.name.replace(/\s+/g, "-")}.png`;
    link.href = generatedFlier;
    link.click();
  };

  // Share the flier (if Web Share API is available)
  const shareFlier = async () => {
    if (!generatedFlier) return;

    try {
      // Convert base64 to blob
      const response = await fetch(generatedFlier);
      const blob = await response.blob();
      const file = new File([blob], "TAC-Youth-Convocation-Flier.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "I Will Be Attending - TAC Youth Convocation",
          text: "Join me at the Easter Youth Convocation 2026!",
          files: [file],
        });
      } else {
        // Fallback - just download
        downloadFlier();
      }
    } catch (err) {
      console.error("Error sharing:", err);
      downloadFlier(); // Fallback to download
    }
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
              className="ticket-info-grid"
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
                className="text-accent-gradient ticket-code"
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

          {/* Flier Generator Section */}
          <div
            className="no-print"
            style={{
              marginTop: "2.5rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid var(--glass-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <ImageIcon size={24} color="var(--accent)" />
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                Get Your &quot;I Will Be Attending&quot; Flier
              </h2>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              Upload your photo to create a personalized flier and share it on social media!
            </p>

            {/* Photo Upload */}
            <div className="file-upload-wrapper" style={{ marginBottom: "1.5rem" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="file-upload-input"
              />
              <div className="file-upload-content">
                <UploadCloud size={32} className="file-upload-icon" />
                <span
                  style={{
                    fontWeight: 500,
                    color: userPhoto ? "white" : "var(--text-muted)",
                  }}
                >
                  {userPhoto ? "Photo uploaded! Click to change" : "Click or drag your photo here"}
                </span>
              </div>
            </div>

            {/* Photo Cropper - Instagram-style drag & zoom */}
            {userPhoto && !generatedFlier && (
              <div style={{ marginBottom: "1.5rem" }}>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    marginBottom: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  Drag to reposition • Scroll or pinch to zoom
                </p>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "300px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid var(--glass-border)",
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  <Cropper
                    image={userPhoto}
                    crop={crop}
                    zoom={zoom}
                    aspect={370 / 460} // Portrait frame ratio (width/height)
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    showGrid={false}
                    style={{
                      containerStyle: { borderRadius: "12px" },
                      cropAreaStyle: { border: "3px solid var(--accent)" },
                    }}
                  />
                </div>
                
                {/* Zoom Slider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "1rem",
                    padding: "0 0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{
                      flex: 1,
                      accentColor: "var(--accent)",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", minWidth: "40px" }}>
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {userPhoto && !generatedFlier && (
              <button
                onClick={generateFlier}
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem" }}
                disabled={isGenerating || !croppedAreaPixels}
              >
                {isGenerating ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} />
                    Generate My Flier
                  </>
                )}
              </button>
            )}

            {/* Generated Flier Preview */}
            {generatedFlier && (
              <div>
                <div
                  style={{
                    marginBottom: "1.5rem",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid var(--accent)",
                  }}
                >
                  <img
                    src={generatedFlier}
                    alt="Your personalized flier"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={downloadFlier}
                    className="btn btn-primary"
                    style={{ padding: "1rem" }}
                  >
                    <Download size={18} />
                    Download
                  </button>
                  <button
                    onClick={shareFlier}
                    className="btn btn-secondary"
                    style={{ padding: "1rem" }}
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
                <button
                  onClick={() => {
                    setGeneratedFlier(null); // Go back to adjustment mode
                  }}
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "1rem", padding: "0.75rem" }}
                >
                  Adjust Photo Position
                </button>
                <button
                  onClick={() => {
                    setUserPhoto(null);
                    setGeneratedFlier(null);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCroppedAreaPixels(null);
                  }}
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
                >
                  Use Different Photo
                </button>
              </div>
            )}

            {/* Hidden Canvas for image generation */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
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
            <Image
              src="/taclogo.jpeg"
              alt="TAC Logo"
              width={40}
              height={40}
              style={{ borderRadius: "8px", objectFit: "cover" }}
            />
            <span className="text-gradient">Youth Convocation</span>
          </div>
        </div>
      </nav>

      {/* Registration Closed Banner and Hero Section */}
      <section
        style={{ paddingTop: "140px", paddingBottom: "60px" }}
        className="fade-in"
      >
        <div className="container">
          {/* Registration Closed Banner */}
          {/* Registration Closed Banner removed as per user request */}
          <div
            className="hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div style={{ maxWidth: "600px" }}>
              <h1
                className="text-gradient hero-title"
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
                Youth Convocation. Registration is now closed. We look forward to seeing all registered participants!
              </p>

              {/* Account Details Box */}
              <div
                className="account-details-box"
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
                  className="divider"
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

            {/* Right Side - Registration Closed Notice (instead of form) */}
            <div
              id="register"
              className="glass-card slide-up"
              style={{ animationDelay: "0.2s", textAlign: "center", padding: "2.5rem 2rem" }}
            >
              <h2 style={{ fontSize: "1.75rem", marginBottom: "1.2rem", color: "#ff4d6d" }}>
                Registration Closed
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "1.05rem",
                  marginBottom: "1.5rem",
                }}
              >
                Registration is now <span style={{ textDecoration: "underline" }}>CLOSED</span>.<br />
                If you have registered, please come to the camp with your registration code for physical confirmation.<br />
                New registrations are only possible physically at the camp venue.
              </p>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🙏</div>
              <div style={{ color: "#ff4d6d", fontWeight: 600 }}>
                Thank you for your interest and support!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{ padding: "4rem 0", background: "rgba(0,0,0,0.2)" }}>
        <div className="container">
          <h2
            className="text-gradient"
            style={{
              fontSize: "1.75rem",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Our Community
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              "/WhatsApp Image 2026-03-08 at 9.10.28 PM.jpeg",
              "/WhatsApp Image 2026-03-08 at 9.10.28 PM (1).jpeg",
              "/WhatsApp Image 2026-03-08 at 9.10.28 PM (2).jpeg",
              "/WhatsApp Image 2026-03-08 at 9.10.28 PM (3).jpeg",
            ].map((src, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <Image
                  src={src}
                  alt={`Community image ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </main>
  );
}
