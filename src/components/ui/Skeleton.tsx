import { concatClassNames } from '@lib/utils'

export default function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={concatClassNames('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}
