export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`doc-skeleton overflow-hidden rounded-xl ${className}`} />;
}
