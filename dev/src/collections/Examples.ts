import { CollectionConfig, Field } from 'payload/types'
//@ts-ignore
import { tableField } from '../../../src/index'
import mockData from '../mocks/mockData'
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
        pagination: true, // Enable pagination?
        paginationPageSize: 10, // Default pagination page size
        paginationPageSizes: [5, 10, 25, 50, 100], // Available pagination page sizes
        editable: false, // Allow cells to be edited?
        rowSelection: true, // Enable row selection
        columns: [
          {
            key: 'id',
            name: 'ID',
            enableSorting: true, // Allow this column to be sorted
          },
          { key: 'title', name: 'Title' },
          { key: 'year', name: 'Year' },
        ],
      },
    ) as Field,
  ],
}

export default Examples
