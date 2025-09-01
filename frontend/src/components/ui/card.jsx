export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
