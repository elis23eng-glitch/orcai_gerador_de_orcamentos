'use client'

import { Hammer, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SERVICE_SUGGESTIONS,
  UNITS,
  computeTotals,
  createEmptyItem,
  formatCurrency,
  formatPercent,
  lineTotal,
  parseCurrencyInput,
  sanitizePercentInput,
  type Proposal,
  type ServiceItem,
  type Unit,
} from '@/lib/quote'

interface ServicesCardProps {
  items: ServiceItem[]
  taxPct: string
  bdiPct: string
  onChange: (patch: Partial<Pick<Proposal, 'items' | 'taxPct' | 'bdiPct'>>) => void
}

const WIDE_GRID =
  '@3xl:grid-cols-[minmax(0,1fr)_80px_104px_128px_112px_36px] @3xl:items-center @3xl:gap-2'

export function ServicesCard({ items, taxPct, bdiPct, onChange }: ServicesCardProps) {
  const totals = computeTotals(items, taxPct, bdiPct)
  const setItems = (next: ServiceItem[]) => onChange({ items: next })

  const updateItem = (id: string, patch: Partial<ServiceItem>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const removeItem = (id: string) =>
    setItems(items.length > 1 ? items.filter((i) => i.id !== id) : [createEmptyItem()])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hammer className="size-4 text-primary" aria-hidden="true" />
          Serviços
        </CardTitle>
        <CardDescription>Adicione os itens do orçamento. Os totais são calculados automaticamente.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => setItems([...items, createEmptyItem()])}>
            <Plus data-icon="inline-start" />
            Adicionar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="@container flex flex-col gap-3">
        <datalist id="service-suggestions">
          {SERVICE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <div
          aria-hidden="true"
          className={`hidden px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground @3xl:grid ${WIDE_GRID}`}
        >
          <span>Serviço</span>
          <span>Qtd.</span>
          <span>Unidade</span>
          <span>Valor unit.</span>
          <span className="text-right">Total</span>
          <span />
        </div>

        <ul className="flex flex-col gap-3 @3xl:gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`grid grid-cols-2 items-end gap-3 rounded-lg border bg-muted/40 p-3 @lg:grid-cols-[80px_104px_minmax(0,1fr)_minmax(0,1fr)_36px] @3xl:rounded-none @3xl:border-0 @3xl:bg-transparent @3xl:p-0 ${WIDE_GRID}`}
            >
              <div className="col-span-2 flex flex-col gap-1.5 @lg:col-span-5 @3xl:col-span-1">
                <Label htmlFor={`svc-${item.id}`} className="@3xl:sr-only">
                  Serviço {index + 1}
                </Label>
                <Input
                  id={`svc-${item.id}`}
                  list="service-suggestions"
                  value={item.service}
                  onChange={(e) => updateItem(item.id, { service: e.target.value })}
                  placeholder="Ex.: Pintura"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`qty-${item.id}`} className="@3xl:sr-only">
                  Quantidade
                </Label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: e.target.value })}
                  className="tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="@3xl:sr-only">Unidade</Label>
                <Select
                  value={item.unit}
                  onValueChange={(v) => v && updateItem(item.id, { unit: v as Unit })}
                >
                  <SelectTrigger className="w-full" aria-label="Unidade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`price-${item.id}`} className="@3xl:sr-only">
                  Valor unitário
                </Label>
                <Input
                  id={`price-${item.id}`}
                  inputMode="numeric"
                  value={formatCurrency(item.unitPriceCents)}
                  onChange={(e) =>
                    updateItem(item.id, { unitPriceCents: parseCurrencyInput(e.target.value) })
                  }
                  className="tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-1.5 @lg:items-end">
                <span className="text-sm font-medium @3xl:sr-only">Total</span>
                <output
                  htmlFor={`qty-${item.id} price-${item.id}`}
                  className="flex h-8 items-center text-sm font-semibold tabular-nums text-foreground"
                >
                  {formatCurrency(lineTotal(item))}
                </output>
              </div>
              <div className="col-span-2 flex justify-end @lg:col-span-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remover serviço ${index + 1}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-2 grid gap-4 rounded-lg border border-dashed p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <p className="text-sm font-medium">Impostos e BDI</p>
            <p className="text-xs text-muted-foreground">
              Opcional. Os percentuais são aplicados sobre o subtotal dos serviços.
            </p>
          </div>
          <PercentField
            id="tax-pct"
            label="Impostos (%)"
            hint="ISS, PIS, COFINS etc."
            value={taxPct}
            onChange={(v) => onChange({ taxPct: v })}
          />
          <PercentField
            id="bdi-pct"
            label="BDI (%)"
            hint="Benefícios e despesas indiretas"
            value={bdiPct}
            onChange={(v) => onChange({ bdiPct: v })}
          />
        </div>

        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between px-1">
            <dt className="text-muted-foreground">
              Subtotal · {items.length} {items.length === 1 ? 'item' : 'itens'}
            </dt>
            <dd className="tabular-nums">{formatCurrency(totals.subtotal)}</dd>
          </div>
          {totals.taxRate > 0 && (
            <div className="flex justify-between px-1">
              <dt className="text-muted-foreground">Impostos ({formatPercent(totals.taxRate)})</dt>
              <dd className="tabular-nums">+ {formatCurrency(totals.tax)}</dd>
            </div>
          )}
          {totals.bdiRate > 0 && (
            <div className="flex justify-between px-1">
              <dt className="text-muted-foreground">BDI ({formatPercent(totals.bdiRate)})</dt>
              <dd className="tabular-nums">+ {formatCurrency(totals.bdi)}</dd>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <dt className="text-sm">Total geral</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatCurrency(totals.total)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function PercentField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(sanitizePercentInput(e.target.value))}
          placeholder="0"
          aria-describedby={`${id}-hint`}
          className="pr-8 tabular-nums"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
        >
          %
        </span>
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </p>
    </div>
  )
}
