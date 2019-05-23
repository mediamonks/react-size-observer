import { SizesConfig } from './types';

type DefineSizeRangesArgs<T> = [[T, string], ...Array<[string, T, string?]>];


type StringifyRef = { current: string };

const validator = <I, O>(
  assert: (val: I) => O,
  before: string = '',
  childValidations: (val: O) => Array<(stringifyRef: StringifyRef) => any> = () => [],
  after: string = '',
) => (value: I) => (stringifyRef: StringifyRef):O => {
  let output: O;
  output = assert(value);

  stringifyRef.current += before;

  childValidations(output).forEach(validation => validation(stringifyRef));

  stringifyRef.current += after;

  return output;
};


const isFirstRange = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      return i;
    }
    throw new Error('expected array');
  },
  '  [',
  items => ([
    
  ]),
  '],\n'
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
  '[\n',
  items => items.map((item, index) => {
    if (!index) {
      return isFirstRange(item);
    }
    if (index === items.length - 1) {
      return isLastRange(item);
    }

    return isMiddleRange(item);
  }),
  '\n]',
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
