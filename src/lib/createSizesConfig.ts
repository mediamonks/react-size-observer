import { SizesConfig, SizeConfig, SizePropertyMap } from './types';

export const pseudoArrayMethods = ['reduce', 'filter', 'map', 'forEach', 'some'] as const;

type CreateSizesArgs<TSizeName extends string> = ReadonlyArray<
  Readonly<[TSizeName, SizePropertyMap?]>
>;

export default function createSizesConfig<TSizeName extends string>(
  ...config: CreateSizesArgs<TSizeName>
): SizesConfig<TSizeName> {
  const sizesConfig: any = {};
  const innerArray: Array<SizeConfig<TSizeName>> = [];
  let hasFallback = false;

  config.forEach(([name, sizePropertyMap = {}], index) => {
    const sizeConfig: SizeConfig<TSizeName> = {
      ...sizePropertyMap,
      name,
    };
    innerArray.push(sizeConfig);
    sizesConfig[name] = index;
    sizesConfig[index] = sizeConfig;

    if (!Object.keys(sizePropertyMap).length) {
      hasFallback = true;
      if (index < config.length - 1) {
        if (hasFallback) {
          throw new Error(
            `The config passed to createSizesConfig at index ${index} has no properties, so it will always match. This only makes sense for as the last item in the config array.`,
          );
        }
      }
    }
  });

  sizesConfig.hasFallbackSize = hasFallback;

  pseudoArrayMethods.forEach(method => (sizesConfig[method] = innerArray[method].bind(innerArray)));
  sizesConfig.length = config.length;

  return sizesConfig;
}
