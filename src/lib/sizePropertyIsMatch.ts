import { SizeIndicatorProps } from './SizeIndicator';

function sizePropertyIsMatch(prop: SizeIndicatorProps, isIntersecting: boolean) {
  switch (prop.configKey) {
    case 'minWidth':
    case 'minHeight':
      return isIntersecting;
    case 'maxWidth':
    case 'maxHeight':
      return !isIntersecting;
    default:
      throw new Error(`Unexpected configKey "${prop.configKey}"`);
  }
}

export default sizePropertyIsMatch;
