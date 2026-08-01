export function MetricCard({
  label,
  value,
  trend,
  tone = "good",
}: Readonly<{
  label: string;
  value: string;
  trend?: string;
  tone?: "good" | "warn";
}>) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend ? <small className={tone}>{trend}</small> : null}
    </article>
  );
}
