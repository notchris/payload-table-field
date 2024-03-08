# Payload Table Field
#### Adds a table field (using [React Table](https://tanstack.com/table/latest)) to [Payload](https://payloadcms.com/).

### Features:

- Display / Edit data using [React Table](https://tanstack.com/table/latest)
- Pagination
- Sorting
- Row Selection


![image](https://github.com/notchris/payload-table-field/blob/main/example.png?raw=true)


## Installation

```bash
  yarn add payload-table-field
  #OR
  npm i payload-table-field
```

## Basic Usage

Import the field and then use it in your payload collection fields array.

```ts
// import plugin
import { CollectionConfig, Field } from 'payload/types'
import { tableField } from 'payload-table-field'

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
            enableSorting: true // Allow this column to be sorted
          },
          { key: 'title', name: 'Title' },
          { key: 'year', name: 'Year' },
        ],
      },
    ) as Field,
  ],
}

export default Examples
```

### Note

While this plugin is still in development, the basic feature set of React Table has been implemented.