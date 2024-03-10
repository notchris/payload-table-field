import { Table, flexRender } from '@tanstack/react-table'
import React from 'react'
import Chevron from 'payload/dist/admin/components/icons/Chevron'

interface TableHeadersProps {
  table: Table<any>
}

export function TableHeaders({ table }: TableHeadersProps) {
  return (
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

                    {header.column.getCanSort() && (
                      <div className="sort-controls">
                        <button
                          onClick={() => header.column.toggleSorting(true)}
                          className={
                            'sort-column__desc sort-column__button ' +
                            (header.column.getIsSorted() === 'desc' ? 'sort-column--active' : '')
                          }
                          type="button"
                        >
                          <Chevron direction="down"></Chevron>
                        </button>
                        <button
                          onClick={() => header.column.toggleSorting(false)}
                          className={
                            'sort-column__asc sort-column__button ' +
                            (header.column.getIsSorted() === 'asc' ? 'sort-column--active' : '')
                          }
                          type="button"
                        >
                          <Chevron direction="up"></Chevron>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
