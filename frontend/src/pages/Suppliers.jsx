import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        API_BASE_URL + "/api/suppliers/"
      );

      if (!response.ok) {
        throw new Error("Backend returned " + response.status);
      }

      const data = await response.json();

      console.log("Suppliers API response:", data);

      const supplierData = Array.isArray(data)
        ? data
        : data.suppliers || [];

      setSuppliers(supplierData);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>

          <h2 style={styles.loadingTitle}>
            Loading Suppliers
          </h2>

          <p style={styles.loadingText}>
            Fetching supplier information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Suppliers</h1>

            <p style={styles.subtitle}>
              Monitor supplier reliability and operational performance
            </p>
          </div>
        </div>

        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>

          <div>
            <h3 style={styles.errorTitle}>
              Backend Connection Failed
            </h3>

            <p style={styles.errorText}>
              {error}
            </p>

            <button
              onClick={fetchSuppliers}
              style={styles.retryButton}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSuppliers = suppliers.length;

  const averageReliability =
    suppliers.length > 0
      ? (
          suppliers.reduce(
            (sum, supplier) =>
              sum + Number(supplier.reliability_score || 0),
            0
          ) / suppliers.length
        ).toFixed(1)
      : "0.0";

  const highReliability = suppliers.filter(
    (supplier) =>
      Number(supplier.reliability_score || 0) >= 90
  ).length;

  const locations = new Set(
    suppliers
      .map((supplier) => supplier.location)
      .filter(Boolean)
  ).size;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Suppliers
          </h1>

          <p style={styles.subtitle}>
            Monitor supplier reliability and operational performance
          </p>
        </div>

        <button
          onClick={fetchSuppliers}
          style={styles.refreshButton}
        >
          ↻ Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={styles.statsGrid}>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            S
          </div>

          <div>
            <p style={styles.statLabel}>
              Total Suppliers
            </p>

            <h2 style={styles.statValue}>
              {totalSuppliers}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            ★
          </div>

          <div>
            <p style={styles.statLabel}>
              Avg. Reliability
            </p>

            <h2 style={styles.statValue}>
              {averageReliability}%
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            ✓
          </div>

          <div>
            <p style={styles.statLabel}>
              High Reliability
            </p>

            <h2 style={styles.statValue}>
              {highReliability}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            L
          </div>

          <div>
            <p style={styles.statLabel}>
              Locations
            </p>

            <h2 style={styles.statValue}>
              {locations}
            </h2>
          </div>
        </div>

      </div>

      {/* SECTION HEADER */}
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>
            Supplier Directory
          </h2>

          <p style={styles.sectionSubtitle}>
            {totalSuppliers} active suppliers
          </p>
        </div>
      </div>

      {/* SUPPLIER LIST */}
      {suppliers.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>
            No suppliers found
          </h3>

          <p>
            There are currently no suppliers available
            from the backend.
          </p>
        </div>
      ) : (
        <div style={styles.supplierGrid}>

          {suppliers.map((supplier, index) => {

            const reliability = Number(
              supplier.reliability_score || 0
            );

            let status = "Good";

            if (reliability >= 90) {
              status = "Excellent";
            } else if (reliability >= 75) {
              status = "Good";
            } else {
              status = "Needs Attention";
            }

            return (
              <div
                key={supplier.id || index}
                style={styles.supplierCard}
              >

                {/* CARD HEADER */}
                <div style={styles.cardHeader}>

                  <div style={styles.supplierAvatar}>
                    {(supplier.supplier_name || "S")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={styles.supplierIdentity}>

                    <h3 style={styles.supplierName}>
                      {supplier.supplier_name ||
                        "Supplier " + (index + 1)}
                    </h3>

                    <span style={styles.supplierId}>
                      Supplier ID: #
                      {supplier.id || "N/A"}
                    </span>

                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(status === "Excellent"
                        ? styles.excellent
                        : status === "Good"
                        ? styles.good
                        : styles.attention),
                    }}
                  >
                    {status}
                  </span>

                </div>

                {/* LOCATION */}
                <div style={styles.infoRow}>

                  <span style={styles.infoLabel}>
                    Location
                  </span>

                  <span style={styles.infoValue}>
                    {supplier.location || "N/A"}
                  </span>

                </div>

                {/* RELIABILITY */}
                <div style={styles.reliabilitySection}>

                  <div style={styles.reliabilityHeader}>

                    <span style={styles.infoLabel}>
                      Reliability Score
                    </span>

                    <strong style={styles.score}>
                      {reliability.toFixed(1)}%
                    </strong>

                  </div>

                  <div style={styles.progressBackground}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width:
                          Math.min(reliability, 100) + "%",
                      }}
                    />
                  </div>

                </div>

                {/* FOOTER */}
                <div style={styles.cardFooter}>

                  <span>
                    Added{" "}
                    {supplier.created_at
                      ? new Date(
                          supplier.created_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>

                  <span style={styles.activeStatus}>
                    ● Active
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


/* =========================================================
   DARK THEME STYLES
   ========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#0f1117",
    color: "#f5f7fb",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#f5f7fb",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#8f96a8",
    fontSize: "14px",
  },

  refreshButton: {
    border: "1px solid #2b3040",
    background: "#171a23",
    color: "#e8ebf2",
    borderRadius: "9px",
    padding: "10px 17px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "34px",
  },

  statCard: {
    background: "#171a23",
    border: "1px solid #272c39",
    borderRadius: "13px",
    padding: "19px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 4px 18px rgba(0,0,0,0.18)",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#22253a",
    color: "#7c83ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
  },

  statLabel: {
    margin: 0,
    color: "#8f96a8",
    fontSize: "12px",
  },

  statValue: {
    margin: "4px 0 0",
    fontSize: "23px",
    fontWeight: 700,
    color: "#f5f7fb",
  },

  sectionHeader: {
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#f5f7fb",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#7f8799",
    fontSize: "13px",
  },

  supplierGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },

  supplierCard: {
    background: "#171a23",
    border: "1px solid #292e3b",
    borderRadius: "14px",
    padding: "21px",
    boxShadow:
      "0 4px 18px rgba(0,0,0,0.18)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
  },

  supplierAvatar: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#22253a",
    color: "#8188ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    flexShrink: 0,
  },

  supplierIdentity: {
    flex: 1,
    minWidth: 0,
  },

  supplierName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f3f8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  supplierId: {
    display: "block",
    marginTop: "4px",
    color: "#737b8e",
    fontSize: "11px",
  },

  statusBadge: {
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  excellent: {
    background: "#173426",
    color: "#52d994",
  },

  good: {
    background: "#182d46",
    color: "#62a9ff",
  },

  attention: {
    background: "#3a2818",
    color: "#f2a65a",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid #282d39",
  },

  infoLabel: {
    color: "#858da0",
    fontSize: "12px",
  },

  infoValue: {
    color: "#dce0e8",
    fontSize: "13px",
    fontWeight: 600,
  },

  reliabilitySection: {
    padding: "14px 0",
    borderTop: "1px solid #282d39",
  },

  reliabilityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "9px",
  },

  score: {
    fontSize: "14px",
    color: "#f0f2f6",
  },

  progressBackground: {
    width: "100%",
    height: "7px",
    borderRadius: "10px",
    background: "#292e3a",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "10px",
    background: "#7077ff",
    transition: "width 0.5s ease",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "14px",
    borderTop: "1px solid #282d39",
    color: "#747d90",
    fontSize: "11px",
  },

  activeStatus: {
    color: "#4fd28b",
    fontWeight: 600,
  },

  emptyCard: {
    background: "#171a23",
    border: "1px solid #292e3b",
    borderRadius: "14px",
    padding: "40px",
    textAlign: "center",
    color: "#858da0",
  },

  loadingContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #292e3b",
    borderTop: "3px solid #7077ff",
    borderRadius: "50%",
  },

  loadingTitle: {
    margin: "16px 0 5px",
    fontSize: "18px",
    color: "#f5f7fb",
  },

  loadingText: {
    margin: 0,
    color: "#7f8799",
    fontSize: "13px",
  },

  errorCard: {
    background: "#171a23",
    border: "1px solid #4a2b32",
    borderRadius: "14px",
    padding: "25px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },

  errorIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#3a2025",
    color: "#ff6b78",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  errorTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#f1f3f8",
  },

  errorText: {
    margin: "6px 0 14px",
    color: "#858da0",
    fontSize: "13px",
  },

  retryButton: {
    border: "none",
    background: "#6269ed",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: 600,
  },
};