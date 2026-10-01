import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// Supply Prescript — Member 5: Closed-Loop & Analytics
// Decision ROI
// ============================================================

const API_URL = "http://127.0.0.1:8000/api/roi/";
const ACTION_API_URL = "http://127.0.0.1:8000/api/roi/by-action";
const MARKET_API_URL = "http://127.0.0.1:8000/api/roi/by-market";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  bg: "#0b1120",
  panel: "#111827",
  panel2: "#151f32",
  border: "#253247",
  text: "#f8fafc",
  muted: "#94a3b8",

  blue: "#60A5FA",
  green: "#34D399",
  red: "#F87171",
  yellow: "#B8A06A",
  purple: "#A78BFA",
  cyan: "#67B7C7",
  orange: "#B97858",

  // Expected vs Actual Cost
  expectedPink: "#E78AC3",
  actualBlue: "#60A5FA",

  // Prescription Action Performance
  actionBlue: "#6FA8DC",
  actionGreen: "#7FBF9B",
  actionPurple: "#9B8FC4",
};

// ============================================================
// COMMON STYLES
// ============================================================

const cardStyle = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 14,
};

const sectionTitle = {
  margin: 0,
  fontSize: 16,
};

const sectionSubtitle = {
  margin: "6px 0 0",
  color: COLORS.muted,
  fontSize: 12,
};

const tooltipStyle = {
  background: COLORS.panel2,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  color: COLORS.text,
};

const buttonStyle = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  borderRadius: 9,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
};

// ============================================================
// HELPERS
// ============================================================

const asNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const formatMoney = (value) =>
  `₹${asNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value) =>
  asNumber(value).toLocaleString("en-IN");

const formatPercent = (value) =>
  `${asNumber(value).toFixed(1)}%`;

function normalizeResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.records)) {
    return data.records;
  }

  if (Array.isArray(data?.actions)) {
    return data.actions;
  }

  if (Array.isArray(data?.markets)) {
    return data.markets;
  }

  return [];
}

function getField(row, ...names) {
  for (const name of names) {
    if (
      row?.[name] !== undefined &&
      row?.[name] !== null &&
      row?.[name] !== ""
    ) {
      return row[name];
    }
  }

  return null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DecisionROI() {
  const [summary, setSummary] = useState({});
  const [actionRows, setActionRows] = useState([]);
  const [marketRows, setMarketRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      summaryResult,
      actionResult,
      marketResult,
    ] = await Promise.allSettled([
      fetch(API_URL),
      fetch(ACTION_API_URL),
      fetch(MARKET_API_URL),
    ]);

    // ========================================================
    // ROI SUMMARY
    // ========================================================

    if (summaryResult.status === "fulfilled") {
      try {
        const response = summaryResult.value;

        if (!response.ok) {
          throw new Error(
            `ROI API returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        setSummary(data || {});
      } catch (err) {
        console.error(
          "Failed to load ROI summary:",
          err
        );

        setSummary({});

        setError(
          "Unable to load ROI summary. Check that the FastAPI backend is running."
        );
      }
    } else {
      console.error(
        "Failed to request ROI summary:",
        summaryResult.reason
      );

      setSummary({});

      setError(
        "Could not connect to the ROI API."
      );
    }

    // ========================================================
    // ACTION DATA
    // ========================================================

    if (actionResult.status === "fulfilled") {
      try {
        const response = actionResult.value;

        if (!response.ok) {
          throw new Error(
            `Action API returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        setActionRows(
          normalizeResponse(data)
        );
      } catch (err) {
        console.error(
          "Failed to load action ROI:",
          err
        );

        setActionRows([]);
      }
    } else {
      setActionRows([]);
    }

    // ========================================================
    // MARKET DATA
    // ========================================================

    if (marketResult.status === "fulfilled") {
      try {
        const response = marketResult.value;

        if (!response.ok) {
          throw new Error(
            `Market API returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        setMarketRows(
          normalizeResponse(data)
        );
      } catch (err) {
        console.error(
          "Failed to load market ROI:",
          err
        );

        setMarketRows([]);
      }
    } else {
      setMarketRows([]);
    }

    setLoading(false);
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // SUMMARY VALUES
  // ==========================================================

  const metrics = useMemo(() => {
    return {
      totalDecisions: getField(
        summary,
        "total_decisions",
        "totalDecisions",
        "decisions"
      ),

      expectedCost: getField(
        summary,
        "expected_cost",
        "expectedCost"
      ),

      actualCost: getField(
        summary,
        "actual_cost",
        "actualCost"
      ),

      savings: getField(
        summary,
        "savings",
        "cost_saving",
        "total_savings"
      ),

      roi: getField(
        summary,
        "roi_percentage",
        "roi",
        "ROI"
      ),

      successRate: getField(
        summary,
        "success_rate",
        "successRate"
      ),

      onTimeRate: getField(
        summary,
        "on_time_rate",
        "onTimeRate"
      ),
    };
  }, [summary]);

  // ==========================================================
  // ACTION CHART DATA
  // ==========================================================

  const formattedActionData = useMemo(() => {
    return actionRows.map((row, index) => ({
      action:
        getField(
          row,
          "Selected_Action",
          "selected_action",
          "Recommended_Action",
          "recommended_action",
          "action"
        ) || `Action ${index + 1}`,

      successRate: asNumber(
        getField(
          row,
          "success_rate",
          "Success_Rate",
          "successRate"
        )
      ),

      decisions: asNumber(
        getField(
          row,
          "total_decisions",
          "decisions",
          "count"
        )
      ),
    }));
  }, [actionRows]);

  // ==========================================================
  // MARKET DATA
  // ==========================================================

  const formattedMarketData = useMemo(() => {
    return marketRows.map((row, index) => ({
      market:
        getField(
          row,
          "Market",
          "market",
          "name"
        ) || `Market ${index + 1}`,

      savings: asNumber(
        getField(
          row,
          "savings",
          "Savings",
          "cost_saving"
        )
      ),
    }));
  }, [marketRows]);

  // ==========================================================
  // DELIVERY DATA
  // ==========================================================

  const deliveryData = useMemo(() => {
    const onTime = asNumber(
      metrics.onTimeRate
    );

    return [
      {
        name: "On Time",
        value: onTime,
      },
      {
        name: "Delayed",
        value: Math.max(
          0,
          100 - onTime
        ),
      },
    ];
  }, [metrics.onTimeRate]);

  // ==========================================================
  // COST DATA
  // ==========================================================

  const costData = useMemo(() => {
    return [
      {
        name: "Expected Cost",
        value: asNumber(
          metrics.expectedCost
        ),
      },
      {
        name: "Actual Cost",
        value: asNumber(
          metrics.actualCost
        ),
      },
    ];
  }, [
    metrics.expectedCost,
    metrics.actualCost,
  ]);

  // ==========================================================
  // PAGE
  // ==========================================================

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
      {/* ====================================================
          HEADER
      ==================================================== */}

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
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 750,
            }}
          >
            Decision ROI
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: COLORS.muted,
              fontSize: 14,
            }}
          >
            Measure cost savings, action success,
            delivery performance and business impact.
          </p>

          <div
            style={{
              marginTop: 10,
              color: error
                ? COLORS.red
                : COLORS.green,
              fontSize: 12,
            }}
          >
            ●{" "}
            {error
              ? "ROI API unavailable"
              : loading
              ? "Loading analytics..."
              : "Analytics loaded"}
          </div>
        </div>

        <button
          onClick={loadData}
          style={buttonStyle}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div
          style={{
            ...cardStyle,
            padding: 14,
            marginBottom: 14,
            color: COLORS.red,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading ? (
        <div
          style={{
            ...cardStyle,
            padding: 60,
            textAlign: "center",
            color: COLORS.muted,
          }}
        >
          Loading ROI analytics...
        </div>
      ) : (
        <>
          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <MetricCard
              title="Total Decisions"
              value={formatNumber(
                metrics.totalDecisions
              )}
              subtitle="Recorded decisions"
              icon="◉"
              accent={COLORS.blue}
            />

            <MetricCard
              title="Cost Savings"
              value={formatMoney(
                metrics.savings
              )}
              subtitle="Total savings"
              icon="₹"
              accent={COLORS.purple}
            />

            <MetricCard
              title="On-Time Rate"
              value={formatPercent(
                metrics.onTimeRate
              )}
              subtitle="Delivery performance"
              icon="✓"
              accent={COLORS.green}
            />

            <MetricCard
              title="Action Success"
              value={formatPercent(
                metrics.successRate
              )}
              subtitle="Successful actions"
              icon="★"
              accent={COLORS.yellow}
            />

            <MetricCard
              title="ROI"
              value={formatPercent(
                metrics.roi
              )}
              subtitle="Return on investment"
              icon="%"
              accent={COLORS.cyan}
            />
          </div>

          {/* ==================================================
              EXPECTED VS ACTUAL + DELIVERY
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(320px,1fr))",
              gap: 18,
              marginBottom: 22,
            }}
          >
            {/* =================================================
                EXPECTED VS ACTUAL COST
            ================================================= */}

            <section
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 340,
              }}
            >
              <h2 style={sectionTitle}>
                Expected vs Actual Cost
              </h2>

              <p style={sectionSubtitle}>
                Compare predicted cost with actual operational cost
              </p>

              <ResponsiveContainer
                width="100%"
                height={270}
              >
                <BarChart
                  data={costData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.border}
                  />

                  <XAxis
                    dataKey="name"
                    stroke={COLORS.muted}
                    tick={{ fontSize: 10 }}
                  />

                  <YAxis
                    stroke={COLORS.muted}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) =>
                      formatMoney(value)
                    }
                  />

                  <Legend />

                  {/* ==========================================
                      EXPECTED = PINK
                      ACTUAL = BLUE
                  ========================================== */}

                  <Bar
                    dataKey="value"
                    name="Cost"
                    radius={[6, 6, 0, 0]}
                  >
                    <Cell
                      fill={COLORS.expectedPink}
                    />

                    <Cell
                      fill={COLORS.actualBlue}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* =================================================
                DELIVERY PERFORMANCE
            ================================================= */}

            <section
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 340,
              }}
            >
              <h2 style={sectionTitle}>
                Delivery Performance
              </h2>

              <p style={sectionSubtitle}>
                On-time versus delayed deliveries
              </p>

              <ResponsiveContainer
                width="100%"
                height={270}
              >
                <PieChart>
                  <Pie
                    data={deliveryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell
                      fill={COLORS.green}
                    />

                    <Cell
                      fill={COLORS.red}
                    />
                  </Pie>

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) =>
                      `${asNumber(value).toFixed(
                        1
                      )}%`
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>
          </div>

          {/* ==================================================
              ACTION + MARKET
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(320px,1fr))",
              gap: 18,
              marginBottom: 22,
            }}
          >
            {/* =================================================
                PRESCRIPTION ACTION PERFORMANCE
            ================================================= */}

            <section
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 340,
              }}
            >
              <h2 style={sectionTitle}>
                Prescription Action Performance
              </h2>

              <p style={sectionSubtitle}>
                Success rate of selected operational actions
              </p>

              {formattedActionData.length ? (
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <BarChart
                    data={formattedActionData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border}
                    />

                    <XAxis
                      dataKey="action"
                      stroke={COLORS.muted}
                      tick={{ fontSize: 10 }}
                    />

                    <YAxis
                      stroke={COLORS.muted}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) =>
                        `${asNumber(
                          value
                        ).toFixed(1)}%`
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="successRate"
                      name="Success Rate (%)"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    >
                      {formattedActionData.map(
                        (entry, index) => {
                          const actionColors = [
                            COLORS.actionBlue,
                            COLORS.actionGreen,
                            COLORS.actionPurple,
                          ];

                          return (
                            <Cell
                              key={`action-${index}`}
                              fill={
                                actionColors[
                                  index %
                                    actionColors.length
                                ]
                              }
                            />
                          );
                        }
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </section>

            {/* =================================================
                SAVINGS BY MARKET
            ================================================= */}

            <section
              style={{
                ...cardStyle,
                padding: 20,
                minHeight: 340,
              }}
            >
              <h2 style={sectionTitle}>
                Savings by Market
              </h2>

              <p style={sectionSubtitle}>
                Total cost savings across markets
              </p>

              {formattedMarketData.length ? (
                <ResponsiveContainer
                  width="100%"
                  height={270}
                >
                  <BarChart
                    data={formattedMarketData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 5,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border}
                    />

                    <XAxis
                      dataKey="market"
                      stroke={COLORS.muted}
                      tick={{ fontSize: 10 }}
                    />

                    <YAxis
                      stroke={COLORS.muted}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) =>
                        formatMoney(value)
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="savings"
                      name="Savings (₹)"
                      fill={COLORS.purple}
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </section>
          </div>

          {/* ==================================================
              ROI SUMMARY
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: 20,
              marginBottom: 22,
            }}
          >
            <h2 style={sectionTitle}>
              ROI Summary
            </h2>

            <p style={sectionSubtitle}>
              Financial impact generated by the
              closed-loop decision process
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: 14,
                marginTop: 18,
              }}
            >
              <SummaryBox
                title="Expected Cost"
                value={formatMoney(
                  metrics.expectedCost
                )}
                accent={COLORS.expectedPink}
              />

              <SummaryBox
                title="Actual Cost"
                value={formatMoney(
                  metrics.actualCost
                )}
                accent={COLORS.actualBlue}
              />

              <SummaryBox
                title="Total Saving"
                value={formatMoney(
                  metrics.savings
                )}
                accent={COLORS.green}
              />

              <SummaryBox
                title="ROI"
                value={formatPercent(
                  metrics.roi
                )}
                accent={COLORS.cyan}
              />
            </div>
          </section>

          {/* ==================================================
              COST SAVING BY MARKET
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: 20,
              marginBottom: 22,
              minHeight: 340,
            }}
          >
            <h2 style={sectionTitle}>
              Cost Saving by Market
            </h2>

            <p style={sectionSubtitle}>
              Savings distribution across markets
            </p>

            {formattedMarketData.length ? (
              <ResponsiveContainer
                width="100%"
                height={270}
              >
                <LineChart
                  data={formattedMarketData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.border}
                  />

                  <XAxis
                    dataKey="market"
                    stroke={COLORS.muted}
                  />

                  <YAxis
                    stroke={COLORS.muted}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) =>
                      formatMoney(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="savings"
                    name="Savings (₹)"
                    stroke={COLORS.cyan}
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: COLORS.cyan,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </section>

          {/* ==================================================
              CLOSED LOOP
          ================================================== */}

          <section
            style={{
              ...cardStyle,
              padding: 20,
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 15,
              }}
            >
              Closed-Loop Decision Intelligence
            </h2>

            <p
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Prediction → Prescription → Decision →
              Outcome → ROI. Decision ROI measures the
              financial and operational impact generated
              by the closed-loop supply-chain process.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <FlowStep
                text="Prediction"
                color={COLORS.blue}
              />

              <FlowArrow />

              <FlowStep
                text="Prescription"
                color={COLORS.purple}
              />

              <FlowArrow />

              <FlowStep
                text="Decision"
                color={COLORS.yellow}
              />

              <FlowArrow />

              <FlowStep
                text="Outcome"
                color={COLORS.green}
              />

              <FlowArrow />

              <FlowStep
                text="ROI"
                color={COLORS.cyan}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

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
          gap: 10,
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
            flexShrink: 0,
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

// ============================================================
// SUMMARY BOX
// ============================================================

function SummaryBox({
  title,
  value,
  accent,
}) {
  return (
    <div
      style={{
        background: COLORS.panel2,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 16,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          color: COLORS.muted,
          fontSize: 11,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 21,
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// FLOW STEP
// ============================================================

function FlowStep({
  text,
  color,
}) {
  return (
    <div
      style={{
        padding: "9px 14px",
        borderRadius: 8,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        color: color,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
}

// ============================================================
// FLOW ARROW
// ============================================================

function FlowArrow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        color: COLORS.muted,
      }}
    >
      →
    </div>
  );
}

// ============================================================
// EMPTY CHART
// ============================================================

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