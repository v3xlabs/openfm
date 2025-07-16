import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { DataContext } from './dataContext'
import type { ExtendedFlitsmeisterData } from '../types/dataTypes'

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<ExtendedFlitsmeisterData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <DataContext.Provider value={{ data, setData, isLoading, setIsLoading }}>
      {children}
    </DataContext.Provider>
  )
} 