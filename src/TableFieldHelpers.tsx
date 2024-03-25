import React, { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Check from 'payload/dist/admin/components/icons/Check'
import { FilterFn, flexRender, Row, Table } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import X from 'payload/dist/admin/components/icons/X'

/** Checkbox column definition  */
export const checkboxColumn = {
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

/* Create checkbox for row selection */
export function IndeterminateCheckbox({
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

/** Row Pinning Column */

export const pinningColumn = {
  id: 'pin',
  header: () => 'Pin',
  cell: ({ row }: { row: any }) =>
    row.getIsPinned() ? (
      <button
        type="button"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        onClick={() => row.pin(false, false, false)}
      >
        <X></X>
      </button>
    ) : (
      <button
        type="button"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        onClick={() => row.pin('top', false, false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-pin"
        >
          <line x1="12" x2="12" y1="17" y2="22" />
          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
        </svg>
      </button>
    ),
}

export function PinnedRow({ row, table }: { row: Row<any>; table: Table<any> }) {
  return (
    <tr
      style={{
        backgroundColor: 'var(--theme-elevation-200)',
        position: 'sticky',
        top: row.getIsPinned() === 'top' ? `${row.getPinnedIndex() * 26 + 48}px` : undefined,
        // bottom:
        //   row.getIsPinned() === 'bottom'
        //     ? `${(table.getBottomRows().length - 1 - row.getPinnedIndex()) * 26}px`
        //     : undefined,
      }}
    >
      {row.getVisibleCells().map(cell => {
        return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
      })}
    </tr>
  )
}

/** Skip pagination reset */
export function useSkipper() {
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

/* Debounced search input */
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <input {...props} value={value} onChange={e => setValue(e.target.value)} />
}

/** Fuzzy filter */
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}
