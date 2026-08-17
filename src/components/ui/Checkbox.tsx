import { concatClassNames } from '@lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export default function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={concatClassNames('flex items-center gap-1.5 text-xs cursor-pointer select-none', className)}>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='h-4 w-4 rounded border-slate-400 accent-slate-950 dark:accent-slate-50 cursor-pointer'
      />
      {label}
    </label>
  );
}
