import { Table } from '@tanstack/react-table'
import React, { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Chevron from 'payload/dist/admin/components/icons/Chevron'

interface TablePaginationProps {
  table: Table<any>
  pageSizes?: number[]
}

export function TablePagination({ table, pageSizes }: TablePaginationProps) {
  return (
    <div className="table-field-controls">
      <div className="table-field-pagination">
        <button
          className={
            'clickable-arrow' + (!table.getCanPreviousPage() ? ' clickable-arrow--is-disabled' : '')
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
          {(pageSizes || [5, 10, 25, 50, 100]).map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Per Page: {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
