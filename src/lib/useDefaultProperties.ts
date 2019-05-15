import typedObjectKeys from './typedObjectKeys';
import { NullableProperties } from './types';

/**
 * Behaves mostly like Object.assign({}, defaults, source):
 * Takes an Object `source`, and will assign the properties from `default` if they
 * weren't already set on `source`.
 * Except:
 * If a property from `defaults` has the value `null` in `source`, the property will be
 * removed entirely
 *
 * @param source
 * @param defaults
 */
const useDefaultProperties = <T extends object>(
  source: NullableProperties<Partial<T>>,
  defaults: T,
): Partial<T> => {
  const result: Partial<T> = {};

  [defaults, result].forEach((obj, _, all) =>
    typedObjectKeys(obj).forEach(key => {
      if (!all.some(other => other[key] === null)) {
        result[key] = obj[key];
      }
    }),
  );

  return result;
};

export default useDefaultProperties;
