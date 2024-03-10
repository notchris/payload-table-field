import { CollectionConfig, Field } from 'payload/types'
//@ts-ignore
import { tableField } from '../../../src/index'
import mockData from '../mocks/mockData'
// Example Collection - For reference only, this must be added to payload.config.ts to be used.

const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'text',
      name: 'title',
    },
    tableField(
      {
        name: 'table_example',
        label: 'Example Table - Movies',
        defaultValue: mockData,
      },
      {
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizes: [5, 10, 25, 50, 100],
        editable: true,
        rowSelection: true,
        columns: [
          { key: 'id', name: 'ID', enableSorting: true },
          { key: 'title', name: 'Title' },
          { key: 'year', name: 'Year' },
        ],
        debugTable: true,
      },
    ) as Field,
  ],
}

export default Examples
