import { SizesConfig } from './types';

type DefineSizeRangesArgs<T> = [[T, string], ...Array<[string, T, string?]>];

type StringifyRef = { current: string };

const validator = <I, O, P extends Array<any> = []>(
  assert: (val: I, ...restArgs: P) => O,
  beforeChildren: (val: O) => string = () => '',
  childValidations: (val: O) => Array<(stringifyRef: StringifyRef) => any> = () => [],
  afterChildren: (val: O) => string = () => '',
) => (value: I, ...restArgs: P) => (stringifyRef: StringifyRef):O => {
  let output: O;
  output = assert(value, ...restArgs);

  stringifyRef.current += beforeChildren(output);

  childValidations(output).forEach(validation => validation(stringifyRef));

  stringifyRef.current += afterChildren(output);

  return output;
};

const isName = validator(
  (val: any) => {
    if (typeof val === 'string') {
      return val;
    }
    throw new Error('asdsad');
  },
  str => str,
);

const isUpperBound = validator(
  (val: any) => {
    if (typeof val === 'string') {
      if (/something/.test(val)) {
        return val;
      }
      throw new Error('wefewfew');
    }
    throw new Error('asdsad');
  },
  str => str,
);

const isMaxLength = validator(
  (val: Array<any>, length: number) => {
    if (val.length > length) {
      throw new Error('maxlength');
    }
    return val;
  }
);

const isFirstRange = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      return i;
    }
    throw new Error('expected array');
  },
  () => '  [',
  items => ([
    isName(items[0]),
    isUpperBound(items[1]),
    isMaxLength(items, 2),
  ]),
  () => '],\n'
);


const isRangesArray = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      if (i.length < 2) {
        throw new Error('expecte darray lengtr 2')
      }
      return i;
    }
    throw new Error('expected array');
  },
  () => '[\n',
  items => items.map((item, index) => {
    if (!index) {
      return isFirstRange(item);
    }
    if (index === items.length - 1) {
      return isLastRange(item);
    }

    return isMiddleRange(item);
  }),
  () => '\n]',
);

function validateArgs<TSizeName extends string>(args: DefineSizeRangesArgs<TSizeName>) {
  isRangesArray(args);
}

export default function defineSizeRanges<TSizeName extends string>(
  ...args: DefineSizeRangesArgs<TSizeName>
): SizesConfig<TSizeName> {
  validateArgs(args);

  return {};
}
