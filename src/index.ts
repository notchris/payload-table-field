import { Field, JSONField } from 'payload/dist/exports/types'
import TableField from './TableField'
import { TableOptions } from '@tanstack/table-core'
import './TableField.scss'

export const tableField = (
  options: Omit<JSONField, 'type'>,
  tableOptions: Omit<TableOptions<unknown>, 'rows' | 'columns' | 'data' | 'getCoreRowModel'> & {
    columns: Record<string, any>
    editable?: boolean
    rowSelection?: boolean
    pagination?: boolean
    paginationPageSize?: number
    paginationPageIndex?: number
    paginationPageSizes?: number[]
  },
): JSONField => {
  return {
    type: 'json',
    admin: {
      components: {
        Field: props => {
          return TableField({
            ...props,
            tableOptions: tableOptions,
          })
        },
      },
    },
    ...options,
  }
}
