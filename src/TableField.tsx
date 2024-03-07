import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Props } from 'payload/components/fields/Json'
import { Label, useField } from 'payload/components/forms'
import Error from 'payload/dist/admin/components/forms/Error'

import Chevron from 'payload/dist/admin/components/icons/Chevron'

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

const columnHelper = createColumnHelper<any>()

type TableFieldProps = Props & {
  path: string
  type: 'json'
  tableOptions: Omit<TableOptions<any>, 'rows' | 'columns' | 'data' | 'getCoreRowModel'> & {
    columns: Record<string, any>
    editable?: boolean
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

  const columns = useMemo<ColumnDef<unknown>[]>(
    () =>
      tableOptions.columns.map((column: any) => {
        return columnHelper.accessor(column.key, {
          enableSorting: column.enableSorting || false,
        })
      }),
    [],
  )

  const field = useField<any[]>({ path, validate: memoizedValidate })
  const { value, showError, setValue, errorMessage } = field
  // const initialRows: readonly any[] = [...value]

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [data, setData] = useState(() => [...value])

  // Give our default column cell renderer editing superpowers!
  const defaultColumn: Partial<ColumnDef<unknown>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue()
      // We need to keep and update the state of the cell normally
      const [value, setValue] = useState(initialValue)

      // When the input is blurred, we'll call our table meta's updateData function
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value)
        data[index][id] = value
        field.setValue(data)
      }

      // If the initialValue is changed external, sync it up with our state
      useEffect(() => {
        setValue(initialValue)
      }, [initialValue])

      return (
        <input value={value as string} onChange={e => setValue(e.target.value)} onBlur={onBlur} />
      )
    },
  }

  function useSkipper() {
    const shouldSkipRef = useRef(true)
    const shouldSkip = shouldSkipRef.current

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = useCallback(() => {
      shouldSkipRef.current = false
    }, [])

    useEffect(() => {
      shouldSkipRef.current = true
    })

    return [shouldSkip, skip] as const
  }

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const table = useReactTable({
    data,
    columns,
    defaultColumn: tableOptions.editable ? defaultColumn : undefined,
    state: {
      sorting,
      pagination,
    },

    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    autoResetPageIndex,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
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
    },
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
                            <div
                              className="sort-controls"
                              {...{ onClick: header.column.getToggleSortingHandler() }}
                            >
                              <button
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
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
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
            {[5, 10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Per Page: {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default TableField
