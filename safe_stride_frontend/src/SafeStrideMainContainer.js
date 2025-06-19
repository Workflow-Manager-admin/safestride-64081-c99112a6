import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * Main Container for SafeStride
 * Features:
 * - Real-time safe route guidance (based on crime/weather data)
 * - SOS alert button
 * - User feedback submission
 * - Fetches current location and weather via APIs
 * - Calculates safe route (mocked)
 * - Light/minimalistic theme with map and sidebar
 */
function SafeStrideMainContainer() {
  // State hooks
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [crimeReports, setCrimeReports] = useState([]);
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState(null);
  const [sosSent, setSosSent] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [locationError, setLocationError] = useState(""); // For geolocation errors

  // Theme colors
  const COLORS = {
    primary: "#4CAF50",
    secondary: "#FFC107",
    accent: "#F44336",
    bgLight: "#FAFAFA",
    text: "#212121",
  };

  // PUBLIC_INTERFACE
  /**
   * useEffect to get the user's actual geolocation on component mount.
   * If denied or geolocation fails, display an error message in UI.
   * Removes fallback to static/demo location.
   */
  useEffect(() => {
    if (currentLocation == null) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setLocationError("");
          },
          (err) => {
            if (err.code === 1) {
              setLocationError(
                "Location permission denied. Please allow location access in your browser to use SafeStride features."
              );
            } else if (err.code === 2) {
              setLocationError(
                "Location unavailable. Please check your device location settings."
              );
            } else if (err.code === 3) {
              setLocationError(
                "Location request timed out. Please try again."
              );
            } else {
              setLocationError(
                "Unable to access your location. Please try again or check browser permissions."
              );
            }
            setCurrentLocation(null);
          }
        );
      } else {
        setLocationError(
          "Geolocation not supported in this browser. SafeStride requires geolocation access."
        );
        setCurrentLocation(null);
      }
    }
  }, [currentLocation]);

  // Fetch weather for current location
  useEffect(() => {
    if (currentLocation) {
      // PUBLIC_INTERFACE
      /**
       * Fetches weather from Open-Meteo public API
       */
      async function fetchWeather() {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&current_weather=true`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          setWeather(data.current_weather || {});
        } catch {
          setWeather({ temperature: "--", weathercode: "?" });
        }
      }
      fetchWeather();
    }
  }, [currentLocation]);

  // Fetch crime reports (mock)
  useEffect(() => {
    // PUBLIC_INTERFACE
    /**
     * Simulate fetching recent crimes in the area.
     */
    function fetchCrimes() {
      // Mock random data
      setCrimeReports([
        { lat: 37.775, lng: -122.419, desc: "Theft", severity: "medium", ts: "12 min ago" },
        { lat: 37.7744, lng: -122.423, desc: "Assault", severity: "high", ts: "30 min ago" },
        { lat: 37.776, lng: -122.418, desc: "Robbery", severity: "medium", ts: "1 hr ago" },
      ]);
    }
    fetchCrimes();
  }, []);

  // Calculate route (mocked)
  const handleCalculateRoute = (e) => {
    e.preventDefault();
    setLoadingRoute(true);

    // PUBLIC_INTERFACE
    /**
     * Simulate route calculation based on user input and mock data,
     * considering crime (avoid most dangerous area) and weather
     */
    setTimeout(() => {
      // Fake "safest" route logic here
      if (destination) {
        setRoute({
          from: currentLocation,
          to: destination,
          polyline: [
            [currentLocation.lat, currentLocation.lng],
            [currentLocation.lat + 0.002, currentLocation.lng + 0.002],
            [currentLocation.lat + 0.004, currentLocation.lng + 0.001],
          ],
          // Caution: highlight if a crime or bad weather is near
          danger:
            crimeReports.length > 0 && crimeReports.some((report) => report.severity === "high")
              ? "Warning: Route passes a recent 'high' severity crime site."
              : weather && weather.temperature && weather.temperature < 2
              ? "Caution: Unusually cold on this route."
              : null,
          weatherHint: weather ? `Current: ${weather.temperature}°C` : "",
        });
      }
      setLoadingRoute(false);
    }, 1400);
  };

  // Handle SOS alert
  const handleSendSOS = () => {
    // PUBLIC_INTERFACE
    /**
     * Simulates sending an SOS alert (trigger snackbar, etc.)
     */
    setSosSent(true);
    setTimeout(() => setSosSent(false), 3000);
    // Real implementation would send alert via API
  };

  // Handle user feedback submission
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      setFeedbacks((fbs) => [...fbs, { feedback, ts: new Date().toLocaleString() }]);
      setFeedback("");
    }
  };

  // Render map (static - real impl would use Google Maps or leaflet)
  const MapView = ({ location, route, crimeReports }) => (
    <div
      style={{
        position: "relative",
        background: "#dbf2e8",
        width: "100%",
        height: "380px",
        borderRadius: 16,
        border: `1px solid ${COLORS.primary}30`,
        boxShadow: "0 1px 8px 0 #0002",
        marginBottom: 18,
        overflow: "hidden",
      }}
    >
      {/* Pseudo-map base */}
      <svg width="100%" height="100%" viewBox="0 0 400 250">
        <rect x="0" y="0" width="400" height="250" fill="#e3f7f1" />
        {/* Mock: route polyline */}
        {route && (
          <polyline
            points="60,180 140,90 320,60"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="5"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px #4caf5070)" }}
          />
        )}
        {/* Mock: current location */}
        {location && (
          <circle cx="60" cy="180" r="12" fill={COLORS.primary} stroke="#333" strokeWidth="2" />
        )}
        {/* Mock: destination */}
        {route && (
          <circle cx="320" cy="60" r="10" fill={COLORS.accent} stroke="#222" strokeWidth="2" />
        )}
        {/* Mock: crime markers */}
        {crimeReports.map((rep, idx) => (
          <rect
            key={idx}
            x={80 + idx * 40}
            y={130 - idx * 10}
            width="14"
            height="14"
            fill={
              rep.severity === "high"
                ? COLORS.accent
                : rep.severity === "medium"
                ? COLORS.secondary
                : "#555"
            }
            stroke="#fff"
            strokeWidth="2"
            rx="2"
            title={rep.desc}
            style={{
              filter:
                rep.severity === "high"
                  ? "drop-shadow(0 0 10px #f4433680)"
                  : undefined,
            }}
          />
        ))}
      </svg>
      <span
        style={{
          position: "absolute",
          top: 14,
          left: 16,
          fontWeight: 500,
          background: "#fff9",
          padding: "2px 8px",
          borderRadius: 8,
          color: COLORS.primary,
          fontSize: 16,
        }}
      >
        Map Preview
      </span>
    </div>
  );

  // Sidebar control panel
  const Sidebar = () => (
    <aside
      style={{
        minWidth: 260,
        maxWidth: 340,
        width: "100%",
        background: COLORS.bgLight,
        borderRadius: 16,
        padding: "1.4rem 1.5rem 1rem 1.5rem",
        boxShadow: "0 2px 18px 0 #0002",
        marginRight: 18,
        color: COLORS.text,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 2 }}>
        SafeStride Controls
      </div>
      {locationError && (
        <div
          style={{
            background: "#fff4f4",
            color: COLORS.accent,
            padding: "8px 14px",
            borderRadius: 6,
            border: `1px solid ${COLORS.accent}40`,
            marginBottom: "10px",
            fontWeight: 500,
            fontSize: 15,
          }}
          role="alert"
        >
          {locationError}
        </div>
      )}
      <form onSubmit={handleCalculateRoute}>
        <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>
          Enter Destination Address:
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="123 Market St"
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              marginBottom: 8,
              padding: "8px 10px",
              border: `1px solid #ddd`,
              borderRadius: 6,
              fontSize: 16,
            }}
            aria-label="Destination address"
          />
        </label>
        <button
          type="submit"
          disabled={loadingRoute || !destination}
          style={{
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: 5,
            fontWeight: 600,
            fontSize: 16,
            width: "100%",
            marginBottom: 3,
            cursor: loadingRoute ? "wait" : "pointer",
          }}
        >
          {loadingRoute ? "Calculating..." : "Find Safest Route"}
        </button>
      </form>
      <button
        onClick={handleSendSOS}
        style={{
          background: COLORS.accent,
          color: "#fff",
          border: "none",
          borderRadius: 5,
          fontWeight: 600,
          fontSize: 16,
          width: "100%",
          padding: "10px 0",
          marginBlock: "4px 2px",
          boxShadow: sosSent ? `0 0 12px 2px ${COLORS.accent}80` : "none",
          cursor: "pointer",
          letterSpacing: 0.6,
        }}
        aria-label="Send SOS Alert"
      >
        🚨 Send SOS Alert
      </button>
      {sosSent && (
        <div
          style={{
            background: "#fff4f4",
            color: COLORS.accent,
            padding: "4px 10px",
            borderRadius: 5,
            fontWeight: 500,
            fontSize: 15,
            margin: "2px 0 5px 0",
            border: `1px solid ${COLORS.accent}45`,
          }}
        >
          SOS Alert Sent!
        </div>
      )}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginTop: 22,
          marginBottom: 10,
        }}
      >
        Submit Feedback
      </div>
      <form onSubmit={handleFeedbackSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share route or safety feedback"
          rows={2}
          required
          style={{
            width: "100%",
            fontSize: 15,
            padding: "9px 6px",
            borderRadius: 5,
            border: "1px solid #bbb",
            resize: "vertical",
            marginBottom: 7,
          }}
          aria-label="Feedback"
        />
        <button
          type="submit"
          style={{
            background: COLORS.secondary,
            color: "#222",
            border: "none",
            borderRadius: 5,
            fontWeight: 500,
            fontSize: 15,
            width: "100%",
            padding: "7px 0",
            cursor: "pointer",
          }}
          disabled={!feedback.trim()}
        >
          Submit Feedback
        </button>
      </form>
      <div style={{ fontSize: 13, color: "#444", marginTop: 8, }}>
        Received ({feedbacks.length}):{" "}
        {feedbacks.map((f, idx) => (
          <div key={idx} style={{ marginTop: 2, marginLeft: 6 }}>
            <span style={{ color: COLORS.secondary, fontWeight: 500 }}>{f.ts}:</span>{" "}
            {f.feedback}
          </div>
        ))}
      </div>
    </aside>
  );

  // Main content panel
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bgLight,
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1.7px solid #ececec",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
          position: "sticky",
          top: 0,
          zIndex: 4,
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              color: COLORS.primary,
              fontWeight: 700,
              fontSize: 27,
              letterSpacing: 1.1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width={28} height={28} viewBox="0 0 20 20" style={{marginRight:8, verticalAlign:"middle"}}>
              <rect
                x="7"
                y="4"
                width="6"
                height="12"
                rx="3"
                fill={COLORS.primary}
                stroke="#333"
                strokeWidth="1"
              />
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
            SafeStride
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span
              style={{
                fontSize: 16,
                color: COLORS.text,
                fontWeight: 500,
                marginRight: 10,
              }}
            >
              {weather
                ? `Weather: ${weather.temperature ?? "--"}°C`
                : "Fetching weather..."}
            </span>
            {/* Avatar-Style */}
            <span
              style={{
                background: COLORS.primary,
                color: "#fff",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              <span style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                SS
              </span>
            </span>
          </div>
        </div>
      </nav>
      {/* Main content - map and sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          maxWidth: 1300,
          width: "100%",
          margin: "0 auto",
          padding: "38px 12px 0 12px",
          minHeight: 540,
        }}
      >
        <Sidebar />
        <div style={{ flex: 1, minWidth: 325, marginLeft: 12 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 1px 16px 0 #0002",
              padding: "1.5rem 1.6rem 2rem 1.6rem",
              marginBottom: 20,
              minHeight: 420,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 27, marginBottom: 15, color: COLORS.primary }}>
              Map View & Route Guidance
            </div>
            <MapView
              location={currentLocation}
              route={route}
              crimeReports={crimeReports}
            />
            <div style={{ marginTop: 16, fontSize: 15.3, color: "#333" }}>
              {route ? (
                <span>
                  Safest route to <b>{destination}</b> calculated.
                  {route.weatherHint && (
                    <span style={{ marginLeft: 12, color: COLORS.secondary }}>
                      {route.weatherHint}
                    </span>
                  )}
                  {route.danger && (
                    <span
                      style={{
                        color: COLORS.accent,
                        marginLeft: 20,
                        fontWeight: 500,
                      }}
                    >
                      {route.danger}
                    </span>
                  )}
                </span>
              ) : (
                <>
                  Enter a destination to get guidance. Crime data and weather shown in context.
                </>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
              <div>
                <span style={{ fontWeight: 500 }}>Crime Reports:</span>{" "}
                {crimeReports.length > 0
                  ? crimeReports.map((c, idx) => (
                      <span
                        key={idx}
                        style={{
                          color:
                            c.severity === "high"
                              ? COLORS.accent
                              : c.severity === "medium"
                              ? COLORS.secondary
                              : "#444",
                          fontWeight: c.severity === "high" ? 700 : 500,
                          marginRight: 6,
                        }}
                        title={c.desc}
                      >
                        {c.desc} ({c.ts})
                      </span>
                    ))
                  : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer
        style={{
          textAlign: "center",
          fontSize: 14,
          padding: "18px 0 8px 0",
          marginTop: 24,
          color: "#394850",
          background: "#eaf6ed",
        }}
      >
        &copy; {new Date().getFullYear()} SafeStride &mdash; For Women’s Urban Travel Safety 🌼
      </footer>
    </div>
  );
}

export default SafeStrideMainContainer;
