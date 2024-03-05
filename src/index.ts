import { JSONField } from 'payload/types'
import TableField from './TableField'
import { TableOptions } from '@tanstack/table-core'
import './TableField.scss'

export const tableField = (
  options: Omit<JSONField, 'type'>,
  tableOptions?: Omit<TableOptions<any>, 'rows' | 'columns' | 'data' | 'getCoreRowModel'> & {
    columns: Record<string, any>
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
