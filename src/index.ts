export * from './lib/types';

export { default as createSizesConfig } from './lib/createSizesConfig';
export { default as DefaultSizeObserverContext } from './lib/DefaultContext';

import createSizeObserverComponent from './lib/createSizeObserverComponent';
import defaultPackageConfig from './lib/defaultPackageConfig';

const SizeObserver = createSizeObserverComponent(defaultPackageConfig);

export default SizeObserver;
