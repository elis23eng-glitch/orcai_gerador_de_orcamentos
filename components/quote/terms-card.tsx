'use client'

import { Handshake } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  PAYMENT_SUGGESTIONS,
  STATUS_META,
  type Proposal,
  type ProposalStatus,
} from '@/lib/quote'

interface TermsCardProps {
  proposal: Proposal
  onChange: (patch: Partial<Proposal>) => void
}

export function TermsCard({ proposal, onChange }: TermsCardProps) {
  const { terms } = proposal
  const setTerm = (key: keyof Proposal['terms'], value: string) =>
    onChange({ terms: { ...terms, [key]: value } })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="size-4 text-primary" aria-hidden="true" />
          Condições Comerciais
        </CardTitle>
        <CardDescription>Pagamento, prazos e observações da proposta.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="payment">Forma de pagamento</Label>
          <Input
            id="payment"
            list="payment-suggestions"
            value={terms.payment}
            onChange={(e) => setTerm('payment', e.target.value)}
            placeholder="Ex.: 50% de sinal + 50% na entrega"
          />
          <datalist id="payment-suggestions">
            {PAYMENT_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="deadline">Prazo de execução (dias úteis)</Label>
          <Input
            id="deadline"
            type="number"
            min={1}
            inputMode="numeric"
            value={terms.deadlineDays}
            onChange={(e) => setTerm('deadlineDays', e.target.value)}
            placeholder="20"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="validity">Validade da proposta (dias)</Label>
          <Input
            id="validity"
            type="number"
            min={1}
            inputMode="numeric"
            value={terms.validityDays}
            onChange={(e) => setTerm('validityDays', e.target.value)}
            placeholder="15"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select
            value={proposal.status}
            onValueChange={(v) => v && onChange({ status: v as ProposalStatus })}
          >
            <SelectTrigger className="w-full" aria-label="Status da proposta">
              <SelectValue>
                {(v: ProposalStatus) => STATUS_META[v]?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_META) as ProposalStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data da proposta</Label>
          <Input
            id="date"
            type="date"
            value={proposal.date}
            onChange={(e) => e.target.value && onChange({ date: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            rows={3}
            value={proposal.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Materiais inclusos, garantias, horários de trabalho..."
          />
        </div>
      </CardContent>
    </Card>
  )
}
