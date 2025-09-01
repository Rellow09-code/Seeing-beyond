export function Input({ className = "", type = "text", ...props }) {
  const baseClasses = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300";
  
  if (type === "file") {
    return (
      <div className="relative">
        <input
          type="file"
          className={`${baseClasses} cursor-pointer file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 ${className}`}
          {...props}
        />
      </div>
    );
  }
  
  return (
    <input
      type={type}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
}
