function KPICard({ title, value, subtitle, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-title">{title}</span>
      </div>

      <div className="kpi-value">
        {value}
      </div>

      {subtitle && (
        <div className="kpi-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default KPICard;