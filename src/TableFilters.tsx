import { Table, flexRender } from '@tanstack/react-table'

// import queryString from 'qs'
import React, { useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Condition from 'payload/dist/admin/components/elements/WhereBuilder/Condition'
import { Props } from 'payload/dist/admin/components/elements/WhereBuilder/Condition/types'
import Button from 'payload/dist/admin/components/elements/Button'
import { Operator, Where } from 'payload/dist/types'
import { Field } from 'payload/dist/exports/types'
const baseClass = 'where-builder'

interface TableFiltersProps {
  table: Table<any>
}

export function TableFilters({ table }: TableFiltersProps) {
  const [conditions, setConditions] = useState<any[]>([])
  const { i18n, t } = useTranslation('general')
  const plural = true
  const [fields, setFields] = useState<
    {
      component?: string
      label: string
      operators: {
        label: string
        value: Operator
      }[]
      props: Field
      value: string
    }[]
  >([])
  return (
    <div className={baseClass}>
      {conditions.length > 0 && (
        <React.Fragment>
          <div className={`${baseClass}__label`}>Filter Where</div>
          <ul className={`${baseClass}__or-filters`}>
            {conditions.map((or, orIndex) => (
              <li key={orIndex}>
                {orIndex !== 0 && <div className={`${baseClass}__label`}>{t('or')}</div>}
                <ul className={`${baseClass}__and-filters`}>
                  {Array.isArray(or?.and) &&
                    or.and.map((_: any, andIndex: number) => (
                      <li key={andIndex}>
                        {andIndex !== 0 && <div className={`${baseClass}__label`}>{t('and')}</div>}
                        <Condition
                          andIndex={andIndex}
                          dispatch={() => {}}
                          fields={fields}
                          key={andIndex}
                          orIndex={orIndex}
                          value={conditions[orIndex].and[andIndex]}
                        />
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
          <Button
            buttonStyle="icon-label"
            className={`${baseClass}__add-or`}
            icon="plus"
            iconPosition="left"
            iconStyle="with-border"
            onClick={() => {
              //@ts-ignore
              if (fields.length > 0) setConditions({ field: fields[0], type: 'add' })
            }}
          >
            {t('or')}
          </Button>
        </React.Fragment>
      )}
      {conditions.length === 0 && (
        <div className={`${baseClass}__no-filters`}>
          <div className={`${baseClass}__label`}>{t('noFiltersSet')}</div>
          <Button
            buttonStyle="icon-label"
            className={`${baseClass}__add-first-filter`}
            icon="plus"
            iconPosition="left"
            iconStyle="with-border"
            onClick={() => {
              //@ts-ignore
              if (fields.length > 0) setConditions({ field: fields[0], type: 'add' })
            }}
          >
            {t('addFilter')}
          </Button>
        </div>
      )}
    </div>
  )
}
