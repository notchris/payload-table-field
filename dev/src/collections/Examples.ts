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
        editable: false, // Allow cells to be edited?
        columns: [
          { key: 'id', name: 'ID', enableSorting: true },
          { key: 'title', name: 'Title' },
          { key: 'year', name: 'Year' },
        ],
      },
    ) as Field,
  ],
}

export default Examples
