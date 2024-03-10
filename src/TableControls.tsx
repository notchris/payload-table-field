import { Table } from '@tanstack/react-table'
import React, { Dispatch, SetStateAction } from 'react'
import Chevron from 'payload/dist/admin/components/icons/Chevron'
import { DebouncedInput } from './TableFieldHelpers'
import Search from 'payload/dist/admin/components/icons/Search'
import { Button } from 'payload/components/elements'
import AnimateHeight from 'react-animate-height'
import X from 'payload/dist/admin/components/icons/X'
import Plus from 'payload/dist/admin/components/icons/Plus'

interface TableControlsProps {
  onGlobalFilterChange: Dispatch<SetStateAction<string>>
  table: Table<any>
  globalFilter: string
  onToggleShowFilters: Dispatch<SetStateAction<boolean>>
  onToggleShowColumns: Dispatch<SetStateAction<boolean>>
  showFilters: boolean
  showColumns: boolean
}

export function TableControls({
  table,
  onGlobalFilterChange,
  globalFilter,
  showFilters,
  showColumns,
  onToggleShowColumns,
  onToggleShowFilters,
}: TableControlsProps) {
  return (
    <div className="table-field-top-controls">
      <div className="list-controls__wrap">
        <div className="search-filter">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => {
              onGlobalFilterChange(String(value))
            }}
            className="search-filter__input"
            placeholder="Search table..."
          />
          <Search></Search>
        </div>

        <div className="list-controls__buttons">
          <div className="list-controls__buttons-wrap">
            <Button
              aria-expanded={showColumns}
              aria-controls="example-panel"
              onClick={() => {
                onToggleShowColumns(!showColumns)
              }}
              className="pill pill--style-light list-controls__toggle-columns  pill--has-action pill--has-icon pill--align-icon-right"
            >
              <span className="pill__label">Columns</span>
              <Chevron direction={showColumns ? 'up' : 'down'}></Chevron>
            </Button>

            <Button
              aria-expanded={showFilters}
              aria-controls="example-panel"
              onClick={() => {
                onToggleShowFilters(!showFilters)
              }}
              className="pill pill--style-light list-controls__toggle-columns  pill--has-action pill--has-icon pill--align-icon-right"
            >
              <span className="pill__label">Filters</span>
              <Chevron direction={showFilters ? 'up' : 'down'}></Chevron>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <AnimateHeight duration={250} height={showColumns ? 'auto' : 0}>
          <div className="list-controls__wrap column-visibility">
            {table
              .getAllLeafColumns()
              .filter(c => c.id !== 'select')
              .map(column => {
                return (
                  <Button
                    key={column.id}
                    onClick={column.getToggleVisibilityHandler()}
                    className={
                      (column.getIsVisible() ? '' : 'column-selector__column--active') +
                      ' pill pill--style-light pill--has-action pill--has-icon pill--align-icon-left pill--draggable'
                    }
                  >
                    {column.getIsVisible() ? <X></X> : <Plus></Plus>}
                    <span className="pill__label">{column.id}</span>
                  </Button>
                )
              })}
          </div>
        </AnimateHeight>

        <AnimateHeight duration={250} height={showFilters ? 'auto' : 0}>
          <div className="list-controls__wrap filters">
            {/* {<TableFilters table={table}></TableFilters>} */}
          </div>
        </AnimateHeight>
      </div>
    </div>
  )
}
