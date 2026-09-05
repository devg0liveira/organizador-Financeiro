import type { YearRow } from "@/lib/investment"
import { formatBRL, formatBRLPrecise } from "@/lib/investment"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface YearlyTableProps {
  rows: YearRow[]
}

export function YearlyTable({ rows }: YearlyTableProps) {
  // ignora o ano 0 (início) na tabela
  const dataRows = rows.filter((r) => r.year > 0)

  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">Ano</TableHead>
            <TableHead className="text-right">Investido</TableHead>
            <TableHead className="text-right">
              <div className="flex flex-col items-end">
                <span className="font-semibold text-foreground">Total (Valores de hoje)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Poder de compra</span>
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex flex-col items-end">
                <span>Total (Nominal)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Futuro na conta</span>
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex flex-col items-end">
                <span>Renda Mensal (Hoje)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Poder de compra</span>
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex flex-col items-end">
                <span>Juros Real</span>
                <span className="text-[10px] text-muted-foreground font-normal">Acima inflação</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataRows.map((row) => (
            <TableRow key={row.year}>
              <TableCell className="font-medium">{row.year}º</TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {formatBRL(row.invested)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold tabular-nums text-primary">
                {formatBRL(row.realTotal)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-foreground">
                {formatBRL(row.total)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-primary">
                {formatBRLPrecise(row.realMonthlyIncome)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {formatBRL(Math.max(0, row.realInterest))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
