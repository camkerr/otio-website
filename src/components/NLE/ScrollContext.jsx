import { createContext, useContext } from 'react';

export const ScrollContext = createContext(0);
export const useScrollPercentage = () => useContext(ScrollContext); 