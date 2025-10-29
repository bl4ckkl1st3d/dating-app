// src/context/FilterContext.tsx
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the filters
export interface AgeFilters {
  minAge: number;
  maxAge: number;
}

// Define the shape of the context value
interface FilterContextType {
  filters: AgeFilters;
  setFilters: Dispatch<SetStateAction<AgeFilters>>;
}

// Default filter values
const defaultFilters: AgeFilters = {
  minAge: 18,
  maxAge: 55, // Or whatever default max you prefer
};

// Create the context with a default value (can be undefined initially)
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Create the provider component
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<AgeFilters>(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

// Create a custom hook for easy access
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};