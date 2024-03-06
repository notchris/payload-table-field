# Payload Table Field
#### Adds a table field (using [React Table](https://tanstack.com/table/latest)) to [Payload](https://payloadcms.com/).

### Features:

- Display / Edit data using React Table[React Table](https://tanstack.com/table/latest)

![image](https://github.com/notchris/payload-table-field/blob/main/example.png?raw=true)


## Installation

```bash
  yarn add payload-table-field
  #OR
  npm i payload-table-field
```

## Basic Usage

You can import and use the field without any additional setup.

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
        // Replace with your data
        defaultValue: mockData,
      },
      {
        columns: [
          { key: 'id', name: 'ID' },
          { key: 'title', name: 'Title' },
          { key: 'year', name: 'Year' },
        ],
      },
    ) as Field,
  ],
}

export default Examples
```

### Configuration


