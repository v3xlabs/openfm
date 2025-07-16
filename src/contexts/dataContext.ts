import { createContext } from 'react'
import type { ExtendedFlitsmeisterData } from '../types/dataTypes'

export interface DataContextType {
  data: ExtendedFlitsmeisterData | null
  setData: (data: ExtendedFlitsmeisterData | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const DataContext = createContext<DataContextType | undefined>(undefined) 