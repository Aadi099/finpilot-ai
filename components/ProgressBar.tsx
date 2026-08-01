export function ProgressBar({
  value,
  color = "#2563eb",
}: Readonly<{
  value: number;
  color?: string;
}>) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-track" aria-label={`${width}% complete`}>
      <span style={{ width: `${width}%`, background: color }} />
    </div>
  );
}
