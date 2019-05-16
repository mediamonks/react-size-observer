import { SizesConfig, SizeConfig, SizeExternalConfig } from './types';

export const pseudoArrayMethods = ['reduce', 'filter', 'map', 'forEach', 'some'] as const;

type CreateSizesArgs<TSizeName extends string> = ReadonlyArray<
  Readonly<[TSizeName, SizeExternalConfig?]>
>;

export default function createSizesConfig<TSizeName extends string>(
  ...config: CreateSizesArgs<TSizeName>
): SizesConfig<TSizeName> {
  const sizesConfig: any = {};
  const innerArray: Array<SizeConfig<TSizeName>> = [];

  config.forEach(([name, sizeExternalConfig = {}], index) => {
    const sizeConfig: SizeConfig<TSizeName> = {
      ...sizeExternalConfig,
      name,
    };
    innerArray.push(sizeConfig);
    sizesConfig[name] = index;
    sizesConfig[index] = sizeConfig;
  });

  pseudoArrayMethods.forEach(method => (sizesConfig[method] = innerArray[method].bind(innerArray)));
  sizesConfig.length = config.length;

  return sizesConfig;
}
