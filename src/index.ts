export * from './lib/types';

export { default as createSizesConfig } from './lib/createSizesConfig';
export { default as DefaultSizeObserverContext } from './lib/DefaultContext';

import defaultPackageConfig from './lib/defaultPackageConfig';
import sizeObserverFactory from './lib/sizeObserverFactory';
const SizeObserver = sizeObserverFactory(defaultPackageConfig);
export default SizeObserver;
