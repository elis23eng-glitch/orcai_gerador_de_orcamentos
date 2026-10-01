import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STATUS_META, type ProposalStatus } from '@/lib/quote'

export function StatusBadge({
  status,
  className,
}: {
  status: ProposalStatus
  className?: string
}) {
  const meta = STATUS_META[status]
  return (
    <Badge variant="outline" className={cn('shrink-0', meta.className, className)}>
      {meta.label}
    </Badge>
  )
}
