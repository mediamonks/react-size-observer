import { SizeProps } from './types';

import { FunctionComponent } from 'react';

export const Size: FunctionComponent<SizeProps> & { __isSizeComponent?: boolean } = () =>
  null;

Size.__isSizeComponent = true;



