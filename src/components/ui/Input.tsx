import { concatClassNames } from '@lib/utils';

export default function Input({ className, type = 'text', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string; type?: string }) {
  const baseClasses = 'flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 px-3 py-2 text-base text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-indigo-950/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-indigo-400 dark:focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:focus-visible:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

  return (
    <input
      type={type}
      className={concatClassNames(baseClasses, className)}
      {...props}
    />
  );
}
