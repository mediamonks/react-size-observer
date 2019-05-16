import React, { forwardRef, memo, CSSProperties, RefForwardingComponent } from 'react';
import { sizeIndicatorStyles } from './styles';

export interface SizeIndicatorProps {
  configKey: string;
  value: number;
}

const SizeIndicator: RefForwardingComponent<HTMLDivElement, SizeIndicatorProps> = (
  { configKey, value },
  ref,
) => {
  const style: CSSProperties = { ...sizeIndicatorStyles };
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

export default memo(forwardRef(SizeIndicator));
