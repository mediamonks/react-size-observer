import React, { forwardRef, memo, CSSProperties, RefForwardingComponent } from 'react';
import { sizeObserverBreakpointStyles } from './styles';
import typedObjectKeys from './typedObjectKeys';
import { SizeConfig } from './types';

interface BreakpointProps {
  config: SizeConfig<any>;
}

const Breakpoint: RefForwardingComponent<HTMLDivElement, BreakpointProps> = ({ config }, ref) => {
  const style = typedObjectKeys(config).reduce<CSSProperties>((css, configKey) => {
    switch (configKey) {
      case 'minWidth':
        css.width = `${config[configKey]!}px`;
        break;
      case 'maxWidth':
        css.width = `${config[configKey]! + 1}px`;
        break;
      case 'minHeight':
        css.height = `${config[configKey]!}px`;
        break;
      case 'maxHeight':
        css.height = `${config[configKey]! + 1}px`;
        break;
    }
    return css;
  }, { ...sizeObserverBreakpointStyles });

  if (!style.height) {
    style.height = '1px';
  }
  if (!style.width) {
    style.width = '1px';
  }

  return <div ref={ref} style={style} />;
};

export default memo(forwardRef(Breakpoint));
