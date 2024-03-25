import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Props } from 'payload/components/fields/Json'
import { Label, useField } from 'payload/components/forms'
import Error from 'payload/dist/admin/components/forms/Error'

import {
  ColumnDef,
  ColumnOrderState,
  FilterFn,
  PaginationState,
  RowData,
  RowPinningState,
  SortingState,
  Table,
  TableOptions,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  checkboxColumn,
  fuzzyFilter,
  PinnedRow,
  pinningColumn,
  useSkipper,
} from './TableFieldHelpers'
import { RankingInfo } from '@tanstack/match-sorter-utils'
import { TablePagination } from './TablePagination'
import { TableControls } from './TableControls'
import { TableHeaders } from './TableHeaders'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type TableFieldProps = Props & {
  path: string
  type: 'json'
  tableOptions: Omit<
    TableOptions<any>,
    'rows' | 'columns' | 'data' | 'getCoreRowModel' | 'filterFns'
  > & {
    columns: Record<string, any>
    columnOrder: Record<string, number>
    editable?: boolean
    rowSelection?: boolean
    rowPinning?: boolean
    pagination?: boolean
    paginationPageSize?: number
    paginationPageIndex?: number
    paginationPageSizes?: number[]
    debugTable?: boolean
  }
}

const TableField: React.FC<TableFieldProps> = ({
  path,
  label,
  required,
  validate,
  tableOptions,
}) => {
  const memoizedValidate = useCallback(
    (value: any[], options: any) => {
      if (validate) {
        return validate(value, { ...options, required })
      }
      return true
    },
    [validate, required],
  )

  /** Create columns */
  const columnHelper = createColumnHelper<any>()
  const columns = useMemo<ColumnDef<unknown>[]>(
    () => [
      ...(tableOptions.rowPinning ? [pinningColumn] : []),
      ...(tableOptions.rowSelection ? [checkboxColumn] : []),
      ...tableOptions.columns.map((column: any) => {
        return columnHelper.accessor(column.key, {
          enableSorting: column.enableSorting || false,
          cell: ({ getValue, row: { index }, column: { id }, table }) => {
            const initialValue = getValue()
            const [value, setValue] = useState(initialValue)

            const onBlur = () => {
              table.options.meta?.updateData(index, id, value)
              data[index][id] = value
              field.setValue(data)
            }

            useEffect(() => {
              setValue(initialValue)
            }, [initialValue])

            return (
              <input
                value={value as string}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
              />
            )
          },
        })
      }),
    ],
    [],
  )

  /** Field setup */
  const field = useField<any[]>({ path, validate: memoizedValidate })
  const { value, showError, setValue, errorMessage } = field

  /** Pagination */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: tableOptions.paginationPageIndex || 0,
    pageSize: tableOptions.paginationPageSize || 10,
  })

  /** Row selection */
  const [rowSelection, setRowSelection] = useState({})

  /** Row Pinning */
  const [rowPinning, setRowPinning] = React.useState<RowPinningState>({
    top: [],
    bottom: [],
  })
  const [keepPinnedRows, setKeepPinnedRows] = React.useState(true)
  const [copyPinnedRows, setCopyPinnedRows] = React.useState(false)

  /** Sorting */
  const [sorting, setSorting] = useState<SortingState>([])

  /** Data */
  const [data, setData] = useState(() => [...value])

  /** Column visiblity */
  const [columnVisibility, setColumnVisibility] = React.useState({})

  /** Column order */
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([])

  /** Global filter */
  const [globalFilter, setGlobalFilter] = React.useState('')

  /** Skip page reset */
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  /** Controls panel visibility */
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)

  /** Table config */
  const tableBaseConfig = {
    state: {
      rowSelection: tableOptions.rowSelection ? rowSelection : undefined,
      rowPinning: tableOptions.rowPinning ? rowPinning : undefined,
      sorting,
      pagination: tableOptions.pagination ? pagination : undefined,
      columnVisibility,
      columnOrder,
      globalFilter,
    },
    columnOrder: ['title', 'id', 'year'],
    enableRowSelection: tableOptions.rowSelection,
    onRowSelectionChange: tableOptions.rowSelection ? setRowSelection : undefined,
    onRowPinningChange: tableOptions.rowPinning ? setRowPinning : undefined,
    onSortingChange: tableOptions.rowSelection ? setSorting : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: tableOptions.rowSelection ? getSortedRowModel() : undefined,
    getPaginationRowModel: tableOptions.pagination ? getPaginationRowModel() : undefined,
    onPaginationChange: tableOptions.pagination ? setPagination : undefined,
    onGlobalFilterChange: setGlobalFilter,
    getFacetedRowModel: getFacetedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    autoResetPageIndex: tableOptions.editable ? autoResetPageIndex : undefined,
    meta: tableOptions.editable
      ? {
          updateData: (rowIndex: number, columnId: any, value: any) => {
            skipAutoResetPageIndex()
            setData(old =>
              old.map((row, index) => {
                if (index === rowIndex) {
                  return {
                    ...old[rowIndex]!,
                    [columnId]: value,
                  }
                }
                return row
              }),
            )
          },
        }
      : undefined,
    keepPinnedRows,
    debugTable: tableOptions.debugTable,
  }

  const tableFieldTemplate = (path: string, label: string, table: Table<any>) => (
    <div className="table-field">
      <Error showError={showError} message={errorMessage as string} />
      <Label htmlFor={path} label={label} required={required} />
      <div className="h-2" />

      <TableControls
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={value => {
          setGlobalFilter(value)
        }}
        onToggleShowColumns={value => setShowColumns(value)}
        onToggleShowFilters={value => setShowFilters(value)}
        showFilters={showFilters}
        showColumns={showColumns}
      ></TableControls>

      <div className="table">
        <table>
          <TableHeaders table={table}></TableHeaders>
          <tbody>
            {table.getTopRows().map(row => (
              <PinnedRow key={row.id} row={row} table={table} />
            ))}
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {tableOptions.pagination && (
        <TablePagination table={table} pageSizes={[5, 10, 25, 50]}></TablePagination>
      )}
    </div>
  )

  const table = useReactTable({
    data,
    columns,
    ...tableBaseConfig,
  })

  return tableFieldTemplate(path, (label as string) || 'T', table)
}

export default TableField
