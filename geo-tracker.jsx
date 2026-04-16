import { useState, useEffect } from "react";

const engines = [
  { id: "chatgpt", name: "ChatGPT", color: "#10a37f", icon: "🤖" },
  { id: "perplexity", name: "Perplexity", color: "#7c5cfc", icon: "🔍" },
  { id: "gemini", name: "Gemini", color: "#4285f4", icon: "✨" },
  { id: "claude", name: "Claude", color: "#cc785c", icon: "🧠" },
];

const recommendations = {
  low: [
    "Add clear brand mentions on your homepage and About page",
    "Get featured in industry blogs and trusted publications",
    "Add FAQ schema markup to your website",
    "Create a Wikipedia or Wikidata entry for your brand",
    "Build presence on authoritative directories",
  ],
  medium: [
    "Improve answer-first content structure on key pages",
    "Add structured data (JSON-LD) for your products/services",
    "Get more backlinks from high-authority domains",
    "Write clear, concise definitions about what your brand does",
  ],
  high: [
    "Maintain consistent brand mentions across the web",
    "Keep content updated regularly",
    "Monitor competitor visibility and stay ahead",
  ],
};

function getRecommendations(score) {
  if (score < 40) return recommendations.low;
  if (score < 70) return recommendations.medium;
  return recommendations.high;
}

function simulateScore(brand, keyword, engine) {
  // Deterministic but varied simulation
  const seed = (brand + keyword + engine).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (seed % 60) + 20;
  const variance = { chatgpt: 15, perplexity: 10, gemini: 5, claude: -5 };
  return Math.min(100, Math.max(5, base + (variance[engine] || 0)));
}

function ScoreRing({ score, color }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={radius} fill="none" stroke="#e8e8e8" strokeWidth="8" />
      <circle
        cx="45" cy="45" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="45" y="50" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a1a1a">
        {score}%
      </text>
    </svg>
  );
}

function EngineCard({ engine, score, visible }) {
  const label = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  const labelColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      border: `2px solid ${visible ? engine.color + "33" : "#f0f0f0"}`,
      transition: "all 0.3s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
    }}>
      <span style={{ fontSize: 28 }}>{engine.icon}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{engine.name}</span>
      <ScoreRing score={score} color={engine.color} />
      <span style={{
        fontSize: 12, fontWeight: 600, color: labelColor,
        background: labelColor + "18", borderRadius: 20, padding: "3px 10px"
      }}>{label} Visibility</span>
    </div>
  );
}

function HistoryRow({ item, onDelete }) {
  const avg = Math.round(Object.values(item.scores).reduce((a, b) => a + b, 0) / Object.values(item.scores).length);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", background: "#fff", borderRadius: 12,
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 8,
    }}>
      <div>
        <span style={{ fontWeight: 700, color: "#222", fontSize: 14 }}>{item.brand}</span>
        <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>"{item.keyword}"</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontWeight: 700, fontSize: 15,
          color: avg >= 70 ? "#10b981" : avg >= 40 ? "#f59e0b" : "#ef4444"
        }}>{avg}% avg</span>
        <span style={{ fontSize: 11, color: "#aaa" }}>{item.date}</span>
        <button onClick={onDelete} style={{
          background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16
        }}>×</button>
      </div>
    </div>
  );
}

export default function GEOTracker() {
  const [tab, setTab] = useState("tracker");
  const [brand, setBrand] = useState("");
  const [keyword, setKeyword] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState([]);

  const avgScore = results
    ? Math.round(Object.values(results.scores).reduce((a, b) => a + b, 0) / engines.length)
    : null;

  const compScores = results && competitor
    ? Object.fromEntries(engines.map(e => [e.id, simulateScore(competitor, keyword, e.id)]))
    : null;

  function runTracker() {
    if (!brand.trim() || !keyword.trim()) return;
    setLoading(true);
    setVisible(false);
    setResults(null);
    setTimeout(() => {
      const scores = Object.fromEntries(engines.map(e => [e.id, simulateScore(brand, keyword, e.id)]));
      const newResult = {
        brand, keyword,
        scores,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        recs: getRecommendations(Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / engines.length)),
      };
      setResults(newResult);
      setHistory(h => [newResult, ...h.slice(0, 9)]);
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }, 2000);
  }

  const tabStyle = (t) => ({
    padding: "10px 22px", borderRadius: 30, fontWeight: 600, fontSize: 14,
    border: "none", cursor: "pointer",
    background: tab === t ? "#1a1a1a" : "transparent",
    color: tab === t ? "#fff" : "#888",
    transition: "all 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f4f0",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a1a", color: "#fff",
        padding: "32px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: "#888", marginBottom: 8, textTransform: "uppercase" }}>
          GEO — Generative Engine Optimization
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
          AI Visibility Tracker
        </h1>
        <p style={{ margin: "8px 0 0", color: "#aaa", fontSize: 14 }}>
          Track your brand across ChatGPT, Perplexity, Gemini & Claude
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 4,
        padding: "16px", background: "#fff",
        boxShadow: "0 1px 0 #eee",
      }}>
        {["tracker", "history"].map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === "tracker" ? "🔎 Tracker" : "📊 History"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>

        {tab === "tracker" && (
          <>
            {/* Input Card */}
            <div style={{
              background: "#fff", borderRadius: 20,
              padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              marginBottom: 20,
            }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase" }}>
                  Your Brand Name
                </label>
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Tata Motors"
                  style={{
                    width: "100%", marginTop: 6, padding: "12px 14px",
                    borderRadius: 10, border: "1.5px solid #e8e8e8",
                    fontSize: 15, outline: "none", boxSizing: "border-box",
                    background: "#fafafa",
                  }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase" }}>
                  Keyword to Check
                </label>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. best car brand in India"
                  style={{
                    width: "100%", marginTop: 6, padding: "12px 14px",
                    borderRadius: 10, border: "1.5px solid #e8e8e8",
                    fontSize: 15, outline: "none", boxSizing: "border-box",
                    background: "#fafafa",
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase" }}>
                  Competitor (Optional)
                </label>
                <input
                  value={competitor}
                  onChange={e => setCompetitor(e.target.value)}
                  placeholder="e.g. Mahindra"
                  style={{
                    width: "100%", marginTop: 6, padding: "12px 14px",
                    borderRadius: 10, border: "1.5px solid #e8e8e8",
                    fontSize: 15, outline: "none", boxSizing: "border-box",
                    background: "#fafafa",
                  }}
                />
              </div>
              <button
                onClick={runTracker}
                disabled={loading || !brand.trim() || !keyword.trim()}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "#ccc" : "#1a1a1a",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  letterSpacing: 0.5,
                }}
              >
                {loading ? "⏳ Checking AI Engines..." : "🚀 Run Visibility Check"}
              </button>
            </div>

            {/* Results */}
            {results && (
              <>
                {/* Overall Score */}
                <div style={{
                  background: "#1a1a1a", color: "#fff",
                  borderRadius: 20, padding: "20px 24px",
                  marginBottom: 16, textAlign: "center",
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.5s ease",
                }}>
                  <div style={{ fontSize: 13, color: "#aaa", marginBottom: 4 }}>Overall AI Visibility Score</div>
                  <div style={{
                    fontSize: 52, fontWeight: 800,
                    color: avgScore >= 70 ? "#10b981" : avgScore >= 40 ? "#f59e0b" : "#ef4444"
                  }}>{avgScore}%</div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {avgScore >= 70 ? "✅ Strong visibility across AI engines" :
                      avgScore >= 40 ? "⚠️ Moderate — room to improve" :
                        "❌ Low — your brand is missing on AI search"}
                  </div>
                </div>

                {/* Engine Cards */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 12, marginBottom: 16,
                }}>
                  {engines.map((e, i) => (
                    <div key={e.id} style={{
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.4s ease ${i * 0.1}s`,
                    }}>
                      <EngineCard engine={e} score={results.scores[e.id]} visible={visible} />
                    </div>
                  ))}
                </div>

                {/* Competitor Comparison */}
                {compScores && (
                  <div style={{
                    background: "#fff", borderRadius: 20,
                    padding: 20, marginBottom: 16,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.5s ease 0.4s",
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "#1a1a1a" }}>
                      📊 You vs {competitor}
                    </div>
                    {engines.map(e => (
                      <div key={e.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#555" }}>{e.icon} {e.name}</span>
                          <span style={{ fontSize: 12, color: "#888" }}>
                            You: <b style={{ color: "#1a1a1a" }}>{results.scores[e.id]}%</b> &nbsp;|&nbsp;
                            {competitor}: <b style={{ color: "#666" }}>{compScores[e.id]}%</b>
                          </span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: 8, height: 8, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 8,
                            background: e.color,
                            width: `${results.scores[e.id]}%`,
                            transition: "width 1s ease",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                <div style={{
                  background: "#fff", borderRadius: 20,
                  padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.5s ease 0.5s",
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: "#1a1a1a" }}>
                    💡 What To Fix
                  </div>
                  {results.recs.map((r, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      marginBottom: 10,
                    }}>
                      <span style={{
                        minWidth: 22, height: 22, borderRadius: "50%",
                        background: "#1a1a1a", color: "#fff",
                        fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: "#444", lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === "history" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 16 }}>
              📊 Past Checks
            </div>
            {history.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "#aaa", fontSize: 14,
                background: "#fff", borderRadius: 20,
              }}>
                No history yet.<br />Run your first visibility check!
              </div>
            ) : (
              history.map((item, i) => (
                <HistoryRow
                  key={i} item={item}
                  onDelete={() => setHistory(h => h.filter((_, j) => j !== i))}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
