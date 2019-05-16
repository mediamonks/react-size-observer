import React, { forwardRef, memo, CSSProperties, RefForwardingComponent } from 'react';
import { sizeObserverBreakpointStyles } from './styles';

export interface BreakpointIndicatorProps {
  configKey: string;
  value: number;
}

const BreakpointIndicator: RefForwardingComponent<HTMLDivElement, BreakpointIndicatorProps> = (
  { configKey, value },
  ref,
) => {
  const style: CSSProperties = { ...sizeObserverBreakpointStyles };
  switch (configKey) {
    case 'minWidth':
      style.width = `${value}px`;
      style.height = '1px';
      break;
    case 'maxWidth':
      style.width = `${value + 1}px`;
      style.height = '1px';
      break;
    case 'minHeight':
      style.height = `${value}px`;
      style.width = '1px';
      break;
    case 'maxHeight':
      style.height = `${value + 1}px`;
      style.width = '1px';
      break;
  }

  return <div ref={ref} style={style} />;
};

export default memo(forwardRef(BreakpointIndicator));
