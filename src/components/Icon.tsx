export default function Icon({
  name, size = 20, filled = false, className = '',
}: { name: string; size?: number; filled?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{ fontSize: size, fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  );
}