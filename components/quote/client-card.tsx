'use client'

import { Building2, UserRound } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  maskCNPJ,
  maskCPF,
  maskPhone,
  type Client,
  type ClientType,
  type ProjectType,
} from '@/lib/quote'

interface ClientCardProps {
  client: Client
  projectType: ProjectType
  onClientChange: (client: Client) => void
  onProjectTypeChange: (projectType: ProjectType) => void
}

const CLIENT_TYPES: { value: ClientType; label: string; icon: typeof UserRound }[] = [
  { value: 'PF', label: 'Pessoa Física', icon: UserRound },
  { value: 'PJ', label: 'Pessoa Jurídica', icon: Building2 },
]

export function ClientCard({
  client,
  projectType,
  onClientChange,
  onProjectTypeChange,
}: ClientCardProps) {
  const set = (key: keyof Client, value: string) => onClientChange({ ...client, [key]: value })
  const isPJ = client.type === 'PJ'

  const changeType = (type: ClientType) => {
    if (type === client.type) return
    onClientChange({ ...client, type, document: '' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" aria-hidden="true" />
          Cliente e Obra
        </CardTitle>
        <CardDescription>Identificação do contratante, contato e tipo de projeto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium">Tipo de cliente</legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {CLIENT_TYPES.map(({ value, label, icon: Icon }) => {
              const checked = client.type === value
              return (
                <label
                  key={value}
                  className={cn(
                    'flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    checked
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <input
                    type="radio"
                    name="client-type"
                    value={value}
                    checked={checked}
                    onChange={() => changeType(value)}
                    className="sr-only"
                  />
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <Label>Tipo de Projeto</Label>
          <Select
            value={projectType}
            onValueChange={(v) => v && onProjectTypeChange(v as ProjectType)}
          >
            <SelectTrigger className="w-full" aria-label="Tipo de projeto">
              <SelectValue>{(v: ProjectType) => PROJECT_TYPE_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {PROJECT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="client-name">{isPJ ? 'Razão Social' : 'Nome completo'}</Label>
          <Input
            id="client-name"
            value={client.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={isPJ ? 'Ex.: Construtora Horizonte Ltda.' : 'Ex.: Mariana Albuquerque'}
            autoComplete={isPJ ? 'organization' : 'name'}
            required
          />
        </div>

        {isPJ ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-trade-name">Nome Fantasia</Label>
              <Input
                id="client-trade-name"
                value={client.tradeName}
                onChange={(e) => set('tradeName', e.target.value)}
                placeholder="Ex.: Horizonte Obras"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-document">CNPJ</Label>
              <Input
                id="client-document"
                inputMode="numeric"
                value={client.document}
                onChange={(e) => set('document', maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                className="tabular-nums"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-ie">Inscrição Estadual</Label>
              <Input
                id="client-ie"
                value={client.stateRegistration}
                onChange={(e) => set('stateRegistration', e.target.value)}
                placeholder="Ex.: 123.456.789.110 ou Isento"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-document">CPF</Label>
            <Input
              id="client-document"
              inputMode="numeric"
              value={client.document}
              onChange={(e) => set('document', maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              className="tabular-nums"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="client-phone">Telefone / WhatsApp</Label>
          <Input
            id="client-phone"
            type="tel"
            inputMode="numeric"
            value={client.phone}
            onChange={(e) => set('phone', maskPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
          />
        </div>
        <div className={cn('flex flex-col gap-2', !isPJ && 'sm:col-span-2')}>
          <Label htmlFor="client-email">E-mail</Label>
          <Input
            id="client-email"
            type="email"
            value={client.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="cliente@email.com"
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="client-address">Endereço da obra</Label>
          <Input
            id="client-address"
            value={client.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Rua, número, complemento, bairro, cidade/UF"
            autoComplete="street-address"
          />
        </div>
      </CardContent>
    </Card>
  )
}
