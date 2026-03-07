import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  pageSize?: number
  showPagination?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageSize = 10,
  showPagination = true,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} rows={pageSize} className={className} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          header.column.getCanSort() && 'cursor-pointer select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground">
                            {header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={cn(!table.getCanPreviousPage() && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageIndex = table.getState().pagination.pageIndex
                const totalPages = table.getPageCount()
                let pageNumber: number

                if (totalPages <= 5) {
                  pageNumber = i
                } else if (pageIndex < 3) {
                  pageNumber = i
                } else if (pageIndex > totalPages - 4) {
                  pageNumber = totalPages - 5 + i
                } else {
                  pageNumber = pageIndex - 2 + i
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(pageNumber)}
                      isActive={pageNumber === pageIndex}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={cn(!table.getCanNextPage() && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

// Skeleton loader
function DataTableSkeleton({
  columns,
  rows,
  className,
}: {
  columns: number
  rows: number
  className?: string
}) {
  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTableSkeleton }
