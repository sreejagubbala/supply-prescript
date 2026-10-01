
import React, { useEffect, useMemo, useState } from "react";
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

const API_URL = "http://127.0.0.1:8000/api/outcomes/";

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

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const asBool = (value) =>
  value === true ||
  value === 1 ||
  String(value).toLowerCase() === "true" ||
  String(value).toLowerCase() === "yes";

function normalizeResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.outcomes)) return data.outcomes;
  return [];
}

function getField(row, ...names) {
  for (const name of names) {
    if (
      row[name] !== undefined &&
      row[name] !== null &&
      row[name] !== ""
    ) {
      return row[name];
    }
  }
  return null;
}

function normalizeRow(row, index) {
  const decisionId = getField(row, "Decision_ID", "decision_id", "id");

  const shipmentId = getField(
    row,
    "Shipment_ID",
    "shipment_id"
  );

  const shippingMode = getField(
    row,
    "Shipping_Mode",
    "shipping_mode"
  );

  const recommended = getField(
    row,
    "Recommended_Action",
    "recommended_action"
  );

  const selected = getField(
    row,
    "Selected_Action",
    "selected_action"
  );

  const expectedCost = asNumber(
    getField(row, "Expected_Cost", "expected_cost")
  );

  const actualCost = asNumber(
    getField(row, "Actual_Cost", "actual_cost")
  );

  const saving = asNumber(
    getField(
      row,
      "Cost_Saving",
      "cost_saving",
      "Savings",
      "savings"
    )
  );

  const delay = asNumber(
    getField(
      row,
      "Actual_Delay_Days",
      "actual_delay_days",
      "Delay_Days",
      "delay_days"
    )
  );

  const onTime = getField(
    row,
    "On_Time",
    "on_time"
  );

  const actionSuccess = getField(
    row,
    "Action_Success",
    "action_success"
  );

  const success =
    actionSuccess !== null
      ? asBool(actionSuccess)
      : onTime !== null
      ? asBool(onTime)
      : delay <= 0;

  const date = getField(
    row,
    "Decision_Date",
    "decision_date",
    "date"
  );

  return {
    ...row,
    _index: index,
    decisionId: decisionId ?? index + 1,
    shipmentId: shipmentId ?? "-",
    shippingMode: shippingMode ?? "-",
    recommended: recommended ?? "-",
    selected: selected ?? "-",
    expectedCost,
    actualCost,
    saving,
    delay,
    success,
    date: date ?? "-",
  };
}

export default function DecisionHistory() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const json = await response.json();
      setRawData(normalizeResponse(json));
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load decision history. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(
    () => rawData.map(normalizeRow),
    [rawData]
  );

  const actions = useMemo(() => {
    const values = rows
      .map((r) => r.selected)
      .filter((v) => v && v !== "-");

    return ["All", ...Array.from(new Set(values))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        String(row.decisionId).toLowerCase().includes(term) ||
        String(row.shipmentId).toLowerCase().includes(term) ||
        String(row.shippingMode).toLowerCase().includes(term) ||
        String(row.selected).toLowerCase().includes(term) ||
        String(row.recommended).toLowerCase().includes(term);

      const matchesAction =
        actionFilter === "All" ||
        row.selected === actionFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Successful" && row.success) ||
        (statusFilter === "Needs Review" && !row.success);

      return (
        matchesSearch &&
        matchesAction &&
        matchesStatus
      );
    });
  }, [rows, search, actionFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = rows.length;

    const successful = rows.filter(
      (r) => r.success
    ).length;

    const delayed = rows.filter(
      (r) => r.delay > 0
    ).length;

    const savings = rows.reduce(
      (sum, r) => sum + r.saving,
      0
    );

    const avgDelay =
      total > 0
        ? rows.reduce((sum, r) => sum + r.delay, 0) /
          total
        : 0;

    const successRate =
      total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      delayed,
      savings,
      avgDelay,
      successRate,
    };
  }, [rows]);

  const actionData = useMemo(() => {
    const map = {};

    rows.forEach((row) => {
      const action = row.selected || "Unknown";
      map[action] = (map[action] || 0) + 1;
    });

    return Object.entries(map).map(
      ([action, count]) => ({
        action,
        count,
      })
    );
  }, [rows]);

  const trendData = useMemo(() => {
    return rows
      .slice()
      .reverse()
      .map((row, index) => ({
        name: row.date !== "-" ? row.date : `D${index + 1}`,
        savings: row.saving,
        delay: row.delay,
      }));
  }, [rows]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        padding: "28px",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  "rgba(96,165,250,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ↳
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 750,
              }}
            >
              Decision History
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: COLORS.muted,
              fontSize: 14,
            }}
          >
            Track recommendations, operational decisions,
            outcomes and business impact.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            borderRadius: 9,
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            ...cardStyle,
            padding: 18,
            marginBottom: 22,
            borderColor: "rgba(248,113,113,0.4)",
            background:
              "rgba(248,113,113,0.08)",
          }}
        >
          <div
            style={{
              color: COLORS.red,
              fontWeight: 700,
              marginBottom: 5,
            }}
          >
            Unable to load decision history
          </div>

          <div
            style={{
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div
          style={{
            ...cardStyle,
            padding: 70,
            textAlign: "center",
            color: COLORS.muted,
          }}
        >
          Loading decision analytics...
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(190px,1fr))",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <MetricCard
              title="Total Decisions"
              value={metrics.total}
              subtitle="Processed records"
              icon="◉"
              accent={COLORS.blue}
            />

            <MetricCard
              title="Success Rate"
              value={`${metrics.successRate.toFixed(1)}%`}
              subtitle={`${metrics.successful} successful outcomes`}
              icon="✓"
              accent={COLORS.green}
            />

            <MetricCard
              title="Cost Savings"
              value={formatMoney(metrics.savings)}
              subtitle="Closed-loop savings"
              icon="₹"
              accent={COLORS.purple}
            />

            <MetricCard
              title="Delayed"
              value={metrics.delayed}
              subtitle={`Avg delay ${metrics.avgDelay.toFixed(1)} days`}
              icon="!"
              accent={COLORS.red}
            />
          </div>

          {/* CHART ROW */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,2fr) minmax(300px,1fr)",
              gap: 18,
              marginBottom: 22,
            }}
          >
            {/* TREND */}
            <div
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 350,
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                  }}
                >
                  Outcome Trend
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  Cost savings and delay across decisions
                </p>
              </div>

              {trendData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border}
                    />

                    <XAxis
                      dataKey="name"
                      stroke={COLORS.muted}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      stroke={COLORS.muted}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: COLORS.panel2,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                        color: COLORS.text,
                      }}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke={COLORS.green}
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="delay"
                      name="Delay"
                      stroke={COLORS.red}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>

            {/* ACTION DISTRIBUTION */}
            <div
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 350,
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                  }}
                >
                  Selected Actions
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  Distribution of operational decisions
                </p>
              </div>

              {actionData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <BarChart
                    data={actionData}
                    layout="vertical"
                    margin={{
                      left: 15,
                      right: 15,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border}
                    />

                    <XAxis
                      type="number"
                      stroke={COLORS.muted}
                    />

                    <YAxis
                      type="category"
                      dataKey="action"
                      width={100}
                      stroke={COLORS.muted}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: COLORS.panel2,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill={COLORS.blue}
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          {/* FILTER BAR */}
          <div
            style={{
              ...cardStyle,
              padding: 16,
              marginBottom: 18,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search decision, shipment, action..."
              style={{
                flex: 1,
                minWidth: 240,
                background: COLORS.panel2,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                borderRadius: 8,
                padding: "10px 13px",
                outline: "none",
              }}
            />

            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value)
              }
              style={selectStyle}
            >
              {actions.map((action) => (
                <option
                  key={action}
                  value={action}
                  style={{
                    background: COLORS.panel,
                  }}
                >
                  {action === "All"
                    ? "All Actions"
                    : action}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={selectStyle}
            >
              <option value="All">All Outcomes</option>
              <option value="Successful">
                Successful
              </option>
              <option value="Needs Review">
                Needs Review
              </option>
            </select>
          </div>

          {/* TABLE */}
          <div
            style={{
              ...cardStyle,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 20px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 15,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                  }}
                >
                  Decision Records
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  {filteredRows.length} of{" "}
                  {rows.length} records
                </p>
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                Closed-loop analytics
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div
                style={{
                  padding: 60,
                  textAlign: "center",
                  color: COLORS.muted,
                }}
              >
                No decision records match the
                selected filters.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 1200,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Decision",
                        "Shipment",
                        "Mode",
                        "Recommendation",
                        "Selected Action",
                        "Expected Cost",
                        "Actual Cost",
                        "Savings",
                        "Delay",
                        "Outcome",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={thStyle}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map(
                      (row, index) => (
                        <tr
                          key={`${row.decisionId}-${index}`}
                          style={{
                            borderTop: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                color: COLORS.blue,
                                fontWeight: 700,
                              }}
                            >
                              #{row.decisionId}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            {row.shipmentId}
                          </td>

                          <td style={tdStyle}>
                            <Badge text={row.shippingMode} />
                          </td>

                          <td style={tdStyle}>
                            {row.recommended}
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                color: COLORS.yellow,
                                fontWeight: 600,
                              }}
                            >
                              {row.selected}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            {formatMoney(
                              row.expectedCost
                            )}
                          </td>

                          <td style={tdStyle}>
                            {formatMoney(
                              row.actualCost
                            )}
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                color:
                                  row.saving >= 0
                                    ? COLORS.green
                                    : COLORS.red,
                                fontWeight: 700,
                              }}
                            >
                              {row.saving >= 0
                                ? "+"
                                : ""}
                              {formatMoney(row.saving)}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                color:
                                  row.delay > 0
                                    ? COLORS.red
                                    : COLORS.green,
                                fontWeight: 600,
                              }}
                            >
                              {row.delay}d
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <StatusBadge
                              success={row.success}
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER EXPLANATION */}
          <div
            style={{
              marginTop: 22,
              ...cardStyle,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background:
                    "rgba(167,139,250,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.purple,
                }}
              >
                ↻
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Closed-Loop Decision Intelligence
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  Prediction → Prescription → Decision →
                  Outcome → ROI
                </div>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Decision History connects the operational
              recommendation with the action actually
              selected and its measured outcome. This
              allows Supply Prescript to evaluate whether
              recommendations created measurable
              operational and financial value.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: 19,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 3,
          height: "100%",
          background: accent,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 9,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 750,
            }}
          >
            {value}
          </div>

          <div
            style={{
              color: COLORS.muted,
              fontSize: 11,
              marginTop: 7,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `${accent}18`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 8px",
        borderRadius: 6,
        background: COLORS.panel2,
        border: `1px solid ${COLORS.border}`,
        color: COLORS.muted,
        fontSize: 11,
      }}
    >
      {text}
    </span>
  );
}

function StatusBadge({ success }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 9px",
        borderRadius: 20,
        background: success
          ? "rgba(52,211,153,0.10)"
          : "rgba(248,113,113,0.10)",
        color: success
          ? COLORS.green
          : COLORS.red,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span>●</span>
      {success ? "Successful" : "Needs Review"}
    </span>
  );
}

function EmptyChart() {
  return (
    <div
      style={{
        height: 270,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.muted,
        fontSize: 13,
      }}
    >
      No chart data available
    </div>
  );
}

const thStyle = {
  padding: "13px 15px",
  textAlign: "left",
  background: COLORS.panel2,
  color: COLORS.muted,
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 15px",
  color: COLORS.text,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const selectStyle = {
  background: COLORS.panel2,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
  minWidth: 150,
};
