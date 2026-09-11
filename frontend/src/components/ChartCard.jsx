function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <div>
          <h3>{title}</h3>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;