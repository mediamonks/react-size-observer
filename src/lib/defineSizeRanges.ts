import { SizesConfig } from './types';

type DefineSizeRangesArgs<T> = [[T, string], ...Array<[string, T, string?]>];

type StringifyRef = { current: string };

class ValidationError extends Error {
  constructor(message: string, public currentValue = '') {
    super(message);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

const validator = <I, O, P extends Array<any> = []>(
  assert: (val: I, ...restArgs: P) => O,
  beforeChildren: (val: O, ...restArgs: P) => string = () => '',
  childValidations: (
    val: O,
    ...restArgs: P
  ) => Array<(stringifyRef: StringifyRef) => any> = () => [],
  afterChildren: (val: O, ...restArgs: P) => string = () => '',
) => (value: I, ...restArgs: P) => (stringifyRef: StringifyRef): O => {
  const output: O = assert(value, ...restArgs);

  stringifyRef.current += beforeChildren(output, ...restArgs);

  childValidations(output, ...restArgs).forEach(validation => validation(stringifyRef));

  stringifyRef.current += afterChildren(output, ...restArgs);

  return output;
};

const isName = validator(
  (val: any, prependComma = true) => {
    if (typeof val === 'string') {
      return val;
    }
    throw new ValidationError('asdsad');
  },
  (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
);

const isUpperBound = validator(
  (val: any, prependComma = true) => {
    if (typeof val === 'string') {
      if (/^\s*<\s*[0-9]+(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?$/.test(val)) {
        return val;
      }
      throw new ValidationError(
        `Expected an upper bound string, for example: "< 500"`,
        `${prependComma ? ', ' : ''}"${val}"`,
      );
    }
    throw new ValidationError(`Expected an upper bound string, got type "${typeof val}"`);
  },
  (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
);

const isLowerBound = validator(
  (val: any, prependComma = true) => {
    if (typeof val === 'string') {
      if (/^[0-9]+(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?\s*>=\s*$/.test(val)) {
        return val;
      }
      throw new ValidationError(
        `Expected a lower bound string, for example: "123 >="`,
        `${prependComma ? ', ' : ''}"${val}"`,
      );
    }
    throw new ValidationError(`Expected a lower bound string, got type "${typeof val}"`);
  },
  (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
);

const isMaxLength = validator((val: Array<any>, length: number) => {
  if (val.length > length) {
    throw new ValidationError('maxlength');
  }
  return val;
});

const isFirstRange = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      return i;
    }
    throw new ValidationError('expected array');
  },
  () => '  [',
  items => [isName(items[0], false), isUpperBound(items[1]), isMaxLength(items, 2)],
  () => '],\n',
);

const isMiddleRange = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      return i;
    }
    throw new ValidationError('expected array');
  },
  () => '  [',
  items => [
    isLowerBound(items[0], false),
    isName(items[1]),
    isUpperBound(items[2]),
    isMaxLength(items, 3),
  ],
  () => '],\n',
);

const isLastRange = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      return i;
    }
    throw new ValidationError('expected array');
  },
  () => '  [',
  items => [isLowerBound(items[0], false), isName(items[1]), isMaxLength(items, 2)],
  () => ']\n',
);

const isRangesArray = validator(
  (i: any) => {
    if (Array.isArray(i)) {
      if (i.length < 2) {
        throw new ValidationError('Expected at least 2 arguments to be passed');
      }
      return i;
    }
    throw new ValidationError('Expected arguments to be an array');
  },
  () => '',
  items =>
    items.map((item, index) => {
      if (!index) {
        return isFirstRange(item);
      }
      if (index === items.length - 1) {
        return isLastRange(item);
      }

      return isMiddleRange(item);
    }),
  () => '\n)',
);

const GENERIC_ERROR = 'Invalid argument passed to defineSizeRanges:';
const GENERIC_ERROR_POST = 'Check the documentation of defineSizeRanges for more info';

function validateArgs<TSizeName extends string>(args: DefineSizeRangesArgs<TSizeName>) {
  const stringifyRef = { current: 'defineSizeRanges(\n' };
  try {
    isRangesArray(args)(stringifyRef);
  } catch (e) {
    if (e instanceof ValidationError) {
      const errorLines = stringifyRef.current.split('\n');
      const errorColumn = errorLines[errorLines.length - 1].length;

      throw new Error(
        `${GENERIC_ERROR}\n${stringifyRef.current}${e.currentValue}\n${' '.repeat(errorColumn)}^${
          e.message
        }\n\n${GENERIC_ERROR_POST}`,
      );
    }
    throw e;
  }
}

export default function defineSizeRanges<TSizeName extends string>(
  ...args: DefineSizeRangesArgs<TSizeName>
): SizesConfig<TSizeName> {
  validateArgs(args);

  return {} as any;
}
