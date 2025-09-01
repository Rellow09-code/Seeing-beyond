export function Card({ children, className }) {
  return <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children }) { return <div className="mb-2">{children}</div>; }
export function CardTitle({ children }) { return <h2 className="text-xl font-bold">{children}</h2>; }
export function CardContent({ children }) { return <div>{children}</div>; }
