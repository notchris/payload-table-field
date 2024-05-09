import { JSONField } from 'payload/dist/exports/types'
import TableField from './TableField'
import { TableOptions } from '@tanstack/table-core'
import './TableField.module.scss'

export const tableField = (
  options: Omit<JSONField, 'type'>,
  tableOptions: Omit<
    TableOptions<unknown>,
    'rows' | 'columns' | 'data' | 'getCoreRowModel' | 'filterFns'
  > & {
    columns: Record<string, any>
    editable?: boolean
    rowSelection?: boolean
    rowPinning?: boolean
    pagination?: boolean
    paginationPageSize?: number
    paginationPageIndex?: number
    paginationPageSizes?: number[]
    // collection?: string
    debugTable?: boolean
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
