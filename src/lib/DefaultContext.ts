import React from 'react';
import { SizeObserverContextValue } from './types';

const DefaultContext = React.createContext<SizeObserverContextValue>({
  named: {},
});

export default DefaultContext;
