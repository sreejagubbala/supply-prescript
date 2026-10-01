import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Supply Prescript — Member 5: Closed-Loop & Analytics
// Decision History. This file is a clean merge of the two conflicting versions.

const API_URL = "http://127.0.0.1:8000/api/outcomes/";
const DECISIONS_API_URL = "http://127.0.0.1:8000/api/decisions/";

const COLORS = {
  bg: "#0b1120",
  panel: "#111827",
  panel2: "#151f32",
  border: "#253247",
  text: "#f8fafc",
  muted: "#94a3b8",
  blue: "#60a5fa",
  green: "#34d399",
  red: "#f87171",
  yellow: "#fbbf24",
  purple: "#a78bfa",
};

const cardStyle = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 14,
};

const asNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const asBool = (value) =>
  value === true ||
  value === 1 ||
  String(value).toLowerCase() === "true" ||
  String(value).toLowerCase() === "yes" ||
  String(value) === "1";

const formatMoney = (value) =>
  `₹${asNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value) => asNumber(value).toLocaleString("en-IN");

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

function normalizeResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.outcomes)) return data.outcomes;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

function getField(row, ...names) {
  for (const name of names) {
    if (row?.[name] !== undefined && row?.[name] !== null && row?.[name] !== "") {
      return row[name];
    }
  }
  return null;
}

function normalizeRow(row, index) {
  const onTime = getField(row, "On_Time", "on_time", "is_on_time");
  const actionSuccess = getField(row, "Action_Success", "action_success", "success");
  const delay = asNumber(
    getField(row, "Actual_Delay_Days", "actual_delay_days", "Delay_Days", "delay_days")
  );
  const success =
    actionSuccess !== null
      ? asBool(actionSuccess)
      : onTime !== null
        ? asBool(onTime)
        : delay <= 0;

  return {
    ...row,
    _index: index,
    decisionId: getField(row, "Decision_ID", "decision_id", "id") ?? index + 1,
    shipmentId: getField(row, "Shipment_ID", "shipment_id") ?? "-",
    shippingMode: getField(row, "Shipping_Mode", "shipping_mode", "mode") ?? "-",
    recommended: getField(row, "Recommended_Action", "recommended_action") ?? "-",
    selected: getField(row, "Selected_Action", "selected_action", "selected_option") ?? "-",
    expectedCost: asNumber(getField(row, "Expected_Cost", "expected_cost", "estimated_cost")),
    actualCost: asNumber(getField(row, "Actual_Cost", "actual_cost")),
    saving: asNumber(getField(row, "Cost_Saving", "cost_saving", "Savings", "savings")),
    delay,
    success,
    date: getField(row, "Decision_Date", "decision_date", "date", "created_at") ?? "-",
  };
}

export default function DecisionHistory() {
  const [rawData, setRawData] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionsError, setDecisionsError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setDecisionsError("");

    const [outcomesResult, decisionsResult] = await Promise.allSettled([
      fetch(API_URL),
      fetch(DECISIONS_API_URL),
    ]);

    if (outcomesResult.status === "fulfilled") {
      try {
        const response = outcomesResult.value;
        if (!response.ok) throw new Error(`Outcomes API returned HTTP ${response.status}`);
        setRawData(normalizeResponse(await response.json()));
      } catch (err) {
        console.error("Failed to load outcomes:", err);
        setRawData([]);
        setError("Unable to load outcome analytics. Check that the FastAPI backend is running and /api/outcomes/ is available.");
      }
    } else {
      console.error("Failed to request outcomes:", outcomesResult.reason);
      setRawData([]);
      setError("Unable to connect to the outcomes API. Check that the FastAPI backend is running.");
    }

    if (decisionsResult.status === "fulfilled") {
      try {
        const response = decisionsResult.value;
        if (!response.ok) throw new Error(`Decisions API returned HTTP ${response.status}`);
        const json = await response.json();
        setDecisions(Array.isArray(json) ? json : normalizeResponse(json));
      } catch (err) {
        console.error("Failed to load executed decisions:", err);
        setDecisions([]);
        setDecisionsError("Executed decisions could not be loaded from /api/decisions/.");
      }
    } else {
      console.error("Failed to request decisions:", decisionsResult.reason);
      setDecisions([]);
      setDecisionsError("Could not connect to /api/decisions/.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = useMemo(() => rawData.map(normalizeRow), [rawData]);

  const actions = useMemo(() => {
    const values = rows.map((row) => row.selected).filter((value) => value && value !== "-");
    return ["All", ...Array.from(new Set(values))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const searchable = [
        row.decisionId,
        row.shipmentId,
        row.shippingMode,
        row.recommended,
        row.selected,
      ].join(" ").toLowerCase();
      const matchesSearch = !term || searchable.includes(term);
      const matchesAction = actionFilter === "All" || row.selected === actionFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Successful" && row.success) ||
        (statusFilter === "Needs Review" && !row.success);
      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [rows, search, actionFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = rows.length;
    const successful = rows.filter((row) => row.success).length;
    const delayed = rows.filter((row) => row.delay > 0).length;
    const savings = rows.reduce((sum, row) => sum + row.saving, 0);
    const avgDelay = total ? rows.reduce((sum, row) => sum + row.delay, 0) / total : 0;
    return {
      total,
      successful,
      delayed,
      savings,
      avgDelay,
      successRate: total ? (successful / total) * 100 : 0,
    };
  }, [rows]);

  const actionData = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      const action = row.selected || "Unknown";
      counts[action] = (counts[action] || 0) + 1;
    });
    return Object.entries(counts).map(([action, count]) => ({ action, count }));
  }, [rows]);

  const trendData = useMemo(
    () =>
      rows
        .slice()
        .reverse()
        .map((row, index) => ({
          name: row.date !== "-" ? formatDate(row.date) : `D${index + 1}`,
          savings: row.saving,
          delay: row.delay,
        })),
    [rows]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        padding: "28px",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 750 }}>Decision History</h1>
          <p style={{ margin: "8px 0 0", color: COLORS.muted, fontSize: 14 }}>
            Track recommendations, operational decisions, outcomes and business impact.
          </p>
          <div style={{ marginTop: 10, color: error ? COLORS.red : COLORS.green, fontSize: 12 }}>
            ● {error ? "Outcomes API unavailable" : loading ? "Loading analytics..." : "Analytics loaded"}
          </div>
        </div>
        <button onClick={loadData} style={buttonStyle}>
          ↻ Refresh
        </button>
      </div>

      {error && <Notice message={error} danger />}
      {decisionsError && <Notice message={decisionsError} />}

      {loading ? (
        <div style={{ ...cardStyle, padding: 60, textAlign: "center", color: COLORS.muted }}>
          Loading decision history...
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <MetricCard title="Total Outcomes" value={formatNumber(metrics.total)} subtitle="Outcome records" icon="◉" accent={COLORS.blue} />
            <MetricCard title="Success Rate" value={`${metrics.successRate.toFixed(1)}%`} subtitle={`${metrics.successful} successful outcomes`} icon="✓" accent={COLORS.green} />
            <MetricCard title="Cost Savings" value={formatMoney(metrics.savings)} subtitle="Recorded savings" icon="₹" accent={COLORS.purple} />
            <MetricCard title="Delayed" value={formatNumber(metrics.delayed)} subtitle={`Average delay ${metrics.avgDelay.toFixed(1)} days`} icon="!" accent={COLORS.red} />
            <MetricCard title="Executed Decisions" value={formatNumber(decisions.length)} subtitle="Decision API records" icon="↳" accent={COLORS.yellow} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 18,
              marginBottom: 22,
            }}
          >
            <section style={{ ...cardStyle, padding: 20, minHeight: 340 }}>
              <h2 style={sectionTitle}>Outcome Trend</h2>
              <p style={sectionSubtitle}>Cost savings and delay across recorded outcomes</p>
              {trendData.length ? (
                <ResponsiveContainer width="100%" height={270}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="name" stroke={COLORS.muted} tick={{ fontSize: 10 }} />
                    <YAxis stroke={COLORS.muted} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="savings" name="Savings (₹)" stroke={COLORS.green} strokeWidth={2} />
                    <Line type="monotone" dataKey="delay" name="Delay (days)" stroke={COLORS.red} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </section>

            <section style={{ ...cardStyle, padding: 20, minHeight: 340 }}>
              <h2 style={sectionTitle}>Selected Actions</h2>
              <p style={sectionSubtitle}>Distribution of operational decisions</p>
              {actionData.length ? (
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={actionData} layout="vertical" margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis type="number" stroke={COLORS.muted} />
                    <YAxis type="category" dataKey="action" width={110} stroke={COLORS.muted} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Decisions" fill={COLORS.blue} radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </section>
          </div>

          <section style={{ ...cardStyle, overflow: "hidden", marginBottom: 22 }}>
            <div style={tableHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17 }}>Executed Decisions</h2>
                <p style={sectionSubtitle}>Decisions recorded from the prescription workflow</p>
              </div>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>{decisions.length} records</span>
            </div>
            {decisions.length === 0 ? (
              <div style={emptyStyle}>No executed decisions found. Confirm that /api/decisions/ returns records.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>{["Decision ID", "Shipment ID", "Selected Option", "Cost", "Executed By", "Status", "Date"].map((heading) => <th key={heading} style={thStyle}>{heading}</th>)}</tr>
                  </thead>
                  <tbody>
                    {[...decisions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((decision) => (
                      <tr key={decision.id}>
                        <td style={tdStyle}><span style={{ color: COLORS.blue, fontWeight: 700 }}>DEC-{String(decision.id ?? "-").padStart(4, "0")}</span></td>
                        <td style={tdStyle}>{decision.shipment_id ?? "-"}</td>
                        <td style={tdStyle}>{decision.selected_option ?? "-"}</td>
                        <td style={tdStyle}>{formatMoney(decision.estimated_cost)}</td>
                        <td style={tdStyle}>{decision.user_name ?? "-"}</td>
                        <td style={tdStyle}><StatusBadge success={String(decision.decision_status ?? "").toLowerCase().includes("execut") || String(decision.decision_status ?? "").toLowerCase().includes("complete")} label={decision.decision_status ?? "Recorded"} /></td>
                        <td style={tdStyle}>{formatDateTime(decision.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={tableHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17 }}>Decision / Outcome Records</h2>
                <p style={sectionSubtitle}>Predicted versus actual performance from the closed-loop process</p>
              </div>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>{filteredRows.length} of {rows.length} records</span>
            </div>

            <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}` }}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search decision, shipment, action..."
                style={inputStyle}
              />
              <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} style={selectStyle}>
                {actions.map((action) => <option key={action} value={action}>{action === "All" ? "All Actions" : action}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={selectStyle}>
                <option value="All">All Outcomes</option>
                <option value="Successful">Successful</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>

            {filteredRows.length === 0 ? (
              <div style={emptyStyle}>No outcome records match the selected filters.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>{["Decision", "Shipment", "Mode", "Recommendation", "Selected Action", "Expected Cost", "Actual Cost", "Savings", "Delay", "Outcome"].map((heading) => <th key={heading} style={thStyle}>{heading}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, index) => (
                      <tr key={`${row.decisionId}-${row.shipmentId}-${index}`} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <td style={tdStyle}><span style={{ color: COLORS.blue, fontWeight: 700 }}>#{row.decisionId}</span></td>
                        <td style={tdStyle}>{row.shipmentId}</td>
                        <td style={tdStyle}><Badge text={row.shippingMode} /></td>
                        <td style={tdStyle}>{row.recommended}</td>
                        <td style={tdStyle}><span style={{ color: COLORS.yellow, fontWeight: 600 }}>{row.selected}</span></td>
                        <td style={tdStyle}>{formatMoney(row.expectedCost)}</td>
                        <td style={tdStyle}>{formatMoney(row.actualCost)}</td>
                        <td style={tdStyle}><span style={{ color: row.saving >= 0 ? COLORS.green : COLORS.red, fontWeight: 700 }}>{row.saving >= 0 ? "+" : ""}{formatMoney(row.saving)}</span></td>
                        <td style={tdStyle}><span style={{ color: row.delay > 0 ? COLORS.red : COLORS.green }}>{row.delay}d</span></td>
                        <td style={tdStyle}><StatusBadge success={row.success} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ ...cardStyle, padding: 20, marginTop: 22 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 15 }}>Closed-Loop Decision Intelligence</h2>
            <p style={{ margin: 0, color: COLORS.muted, fontSize: 13, lineHeight: 1.7 }}>
              Prediction → Prescription → Decision → Outcome → ROI. Decision History connects operational recommendations with selected actions and measured outcomes.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, accent }) {
  return (
    <div style={{ ...cardStyle, padding: 19, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 3, height: "100%", background: accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color: COLORS.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 9 }}>{title}</div>
          <div style={{ fontSize: 25, fontWeight: 750 }}>{value}</div>
          <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 7 }}>{subtitle}</div>
        </div>
        <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: `${accent}18`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{icon}</div>
      </div>
    </div>
  );
}

function Badge({ text }) {
  return <span style={{ display: "inline-flex", padding: "5px 8px", borderRadius: 6, background: COLORS.panel2, border: `1px solid ${COLORS.border}`, color: COLORS.muted, fontSize: 11 }}>{text}</span>;
}

function StatusBadge({ success, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 20, background: success ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)", color: success ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: 700 }}>
      ● {label ?? (success ? "Successful" : "Needs Review")}
    </span>
  );
}

function EmptyChart() {
  return <div style={{ height: 270, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.muted, fontSize: 13 }}>No chart data available</div>;
}

function Notice({ message, danger = false }) {
  return <div style={{ ...cardStyle, padding: 14, marginBottom: 14, color: danger ? COLORS.red : COLORS.yellow, fontSize: 13 }}>{message}</div>;
}

const sectionTitle = { margin: 0, fontSize: 16 };
const sectionSubtitle = { margin: "6px 0 0", color: COLORS.muted, fontSize: 12 };
const tableHeaderStyle = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}` };
const tableStyle = { width: "100%", minWidth: 900, borderCollapse: "collapse" };
const thStyle = { padding: "13px 15px", textAlign: "left", background: COLORS.panel2, color: COLORS.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" };
const tdStyle = { padding: "14px 15px", color: COLORS.text, fontSize: 12, whiteSpace: "nowrap" };
const selectStyle = { background: COLORS.panel2, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 12px", outline: "none", minWidth: 150 };
const inputStyle = { flex: 1, minWidth: 220, background: COLORS.panel2, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 13px", outline: "none" };
const buttonStyle = { background: COLORS.panel, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 9, padding: "10px 16px", cursor: "pointer", fontWeight: 600 };
const tooltipStyle = { background: COLORS.panel2, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text };
const emptyStyle = { padding: 50, textAlign: "center", color: COLORS.muted, fontSize: 13 };
