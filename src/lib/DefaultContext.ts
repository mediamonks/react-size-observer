import { createContext } from 'react';
import { SizeObserverContextValue } from './types';

const DefaultContext = createContext<SizeObserverContextValue>({
  named: {},
});

export default DefaultContext;
