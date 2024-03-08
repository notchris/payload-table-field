import React, { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Props } from 'payload/components/fields/Json'
import { Label, useField } from 'payload/components/forms'
import Error from 'payload/dist/admin/components/forms/Error'

import Chevron from 'payload/dist/admin/components/icons/Chevron'
import Check from 'payload/dist/admin/components/icons/Check'
import { Checkbox } from 'payload/components/forms'

import {
  ColumnDef,
  PaginationState,
  RowData,
  SortingState,
  TableOptions,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

type TableFieldProps = Props & {
  path: string
  type: 'json'
  tableOptions: Omit<TableOptions<any>, 'rows' | 'columns' | 'data' | 'getCoreRowModel'> & {
    columns: Record<string, any>
    editable?: boolean
    rowSelection?: boolean
    pagination?: boolean
    paginationPageSize?: number
    paginationPageIndex?: number
    paginationPageSizes?: number[]
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

  /** Checkbox column definition  */
  const checkboxColumn = {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }: { row: any }) => (
      <IndeterminateCheckbox
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
      />
    ),
  }

  /** Create columns */
  const columnHelper = createColumnHelper<any>()
  const columns = useMemo<ColumnDef<unknown>[]>(
    () => [
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

  /* Create checkbox for row selection */
  function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
  }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
      if (typeof indeterminate === 'boolean') {
        ref.current.indeterminate = !rest.checked && indeterminate
      }
    }, [ref, indeterminate])

    return (
      <div
        className={
          'checkbox-input ' + (rest.checked ? 'select-row__checkbox checkbox-input--checked' : '')
        }
      >
        <div className="checkbox-input__input">
          <input type="checkbox" ref={ref} className={className + ' cursor-pointer'} {...rest} />
          {rest.checked ? <Check></Check> : ''}
        </div>
      </div>
    )
  }

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
  /** Sorting */
  const [sorting, setSorting] = useState<SortingState>([])
  /** Data */
  const [data, setData] = useState(() => [...value])

  /** Skip pagination reset */
  function useSkipper() {
    const shouldSkipRef = useRef(true)
    const shouldSkip = shouldSkipRef.current

    const skip = useCallback(() => {
      shouldSkipRef.current = false
    }, [])

    useEffect(() => {
      shouldSkipRef.current = true
    })

    return [shouldSkip, skip] as const
  }
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  /** Create table */
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: tableOptions.rowSelection ? rowSelection : undefined,
      sorting,
      pagination: tableOptions.pagination ? pagination : undefined,
    },
    enableRowSelection: tableOptions.rowSelection,
    onRowSelectionChange: tableOptions.rowSelection ? setRowSelection : undefined,
    onSortingChange: tableOptions.rowSelection ? setSorting : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: tableOptions.rowSelection ? getSortedRowModel() : undefined,
    getPaginationRowModel: tableOptions.pagination ? getPaginationRowModel() : undefined,
    onPaginationChange: tableOptions.pagination ? setPagination : undefined,
    autoResetPageIndex: tableOptions.editable ? autoResetPageIndex : undefined,
    meta: tableOptions.editable
      ? {
          updateData: (rowIndex, columnId, value) => {
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
    debugTable: true,
  })

  return (
    <div className="table-field">
      <Error showError={showError} message={errorMessage as string} />
      <Label htmlFor={path} label={label} required={required} />
      <div className="h-2" />
      <div className="table">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className:
                              (header.column.getCanSort() ? 'cursor-pointer select-none' : '') +
                              ' sort-header',
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanSort() ? (
                            <div className="sort-controls">
                              <button
                                onClick={() => header.column.toggleSorting(true)}
                                className={
                                  'sort-column__desc sort-column__button ' +
                                  (header.column.getIsSorted() === 'desc'
                                    ? 'sort-column--active'
                                    : '')
                                }
                                type="button"
                              >
                                <Chevron direction="down"></Chevron>
                              </button>
                              <button
                                onClick={() => header.column.toggleSorting(false)}
                                className={
                                  'sort-column__asc sort-column__button ' +
                                  (header.column.getIsSorted() === 'asc'
                                    ? 'sort-column--active'
                                    : '')
                                }
                                type="button"
                              >
                                <Chevron direction="up"></Chevron>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
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
      {tableOptions.pagination ? (
        <div className="table-field-controls">
          <div className="table-field-pagination">
            <button
              className={
                'clickable-arrow' +
                (!table.getCanPreviousPage() ? ' clickable-arrow--is-disabled' : '')
              }
              onClick={e => {
                e.preventDefault()
                table.previousPage()
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <Chevron size="small" direction="left"></Chevron>
            </button>
            <button
              className={
                'clickable-arrow' + (!table.getCanNextPage() ? ' clickable-arrow--is-disabled' : '')
              }
              onClick={e => {
                e.preventDefault()
                table.nextPage()
              }}
              disabled={!table.getCanNextPage()}
            >
              <Chevron size="small" direction="right"></Chevron>
            </button>

            <div className="pagination-label">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount().toLocaleString()}
              </strong>
            </div>

            <div className="goto">
              <span className="divider">|</span>
              <span className="goto-label">Page: </span>
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
                }}
                className="goto-input"
              />
            </div>
          </div>

          <div className="per-page">
            <div>
              {(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                1
              ).toLocaleString()}
              {' - '}
              {(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                1 +
                table.getState().pagination.pageSize -
                1
              ).toLocaleString()}{' '}
              of {table.getRowCount().toLocaleString()}
            </div>

            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {(tableOptions.paginationPageSizes || [5, 10, 25, 50, 100]).map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Per Page: {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

export default TableField
