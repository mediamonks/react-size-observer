import { SizesConfig } from './types';

type DefineSizeRangesArgs<T> = [[T, string], ...Array<[string, T, string?]>];
//
// type StringifyRef = { current: string };
//
// class ValidationError extends Error {
//   constructor(message: string, public currentValue = '') {
//     super(message);
//
//     Object.setPrototypeOf(this, ValidationError.prototype);
//   }
// }
//
// const validator = <I, O, P extends Array<any> = []>(
//   assert: (val: I, ...restArgs: P) => O,
//   beforeChildren: (val: O, ...restArgs: P) => string = () => '',
//   childValidations: (
//     val: O,
//     ...restArgs: P
//   ) => Array<(stringifyRef: StringifyRef) => any> = () => [],
//   afterChildren: (val: O, ...restArgs: P) => string = () => '',
// ) => (value: I, ...restArgs: P) => (stringifyRef: StringifyRef): O => {
//   const output: O = assert(value, ...restArgs);
//
//   stringifyRef.current += beforeChildren(output, ...restArgs);
//
//   childValidations(output, ...restArgs).forEach(validation => validation(stringifyRef));
//
//   stringifyRef.current += afterChildren(output, ...restArgs);
//
//   return output;
// };
//
// const isName = validator(
//   (val: any, prependComma = true) => {
//     if (typeof val === 'string') {
//       return val;
//     }
//     throw new ValidationError('asdsad');
//   },
//   (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
// );
//
// const isUpperBound = validator(
//   (val: any, prependComma = true) => {
//     if (typeof val === 'string') {
//       if (/^\s*<\s*[0-9]+(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?$/.test(val)) {
//         return val;
//       }
//       throw new ValidationError(
//         `Expected an upper bound string, for example: "< 500"`,
//         `${prependComma ? ', ' : ''}"${val}"`,
//       );
//     }
//     throw new ValidationError(`Expected an upper bound string, got type "${typeof val}"`);
//   },
//   (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
// );
//
// const isLowerBound = validator(
//   (val: any, prependComma = true) => {
//     if (typeof val === 'string') {
//       if (/^[0-9]+(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?\s*>=\s*$/.test(val)) {
//         return val;
//       }
//       throw new ValidationError(
//         `Expected a lower bound string, for example: "123 >="`,
//         `${prependComma ? ', ' : ''}"${val}"`,
//       );
//     }
//     throw new ValidationError(`Expected a lower bound string, got type "${typeof val}"`);
//   },
//   (str, prependComma = true) => `${prependComma ? ', ' : ''}"${str}"`,
// );
//
// const isMaxLength = validator((val: Array<any>, length: number) => {
//   if (val.length > length) {
//     throw new ValidationError('maxlength');
//   }
//   return val;
// });
//
// const isFirstRange = validator(
//   (i: any) => {
//     if (Array.isArray(i)) {
//       return i;
//     }
//     throw new ValidationError('expected array');
//   },
//   () => '  [',
//   items => [isName(items[0], false), isUpperBound(items[1]), isMaxLength(items, 2)],
//   () => '],\n',
// );
//
// const isMiddleRange = validator(
//   (i: any) => {
//     if (Array.isArray(i)) {
//       return i;
//     }
//     throw new ValidationError('expected array');
//   },
//   () => '  [',
//   items => [
//     isLowerBound(items[0], false),
//     isName(items[1]),
//     isUpperBound(items[2]),
//     isMaxLength(items, 3),
//   ],
//   () => '],\n',
// );
//
// const isLastRange = validator(
//   (i: any) => {
//     if (Array.isArray(i)) {
//       return i;
//     }
//     throw new ValidationError('expected array');
//   },
//   () => '  [',
//   items => [isLowerBound(items[0], false), isName(items[1]), isMaxLength(items, 2)],
//   () => ']\n',
// );
//
// const isRangesArray = validator(
//   (i: any) => {
//     if (Array.isArray(i)) {
//       if (i.length < 2) {
//         throw new ValidationError('Expected at least 2 arguments to be passed');
//       }
//       return i;
//     }
//     throw new ValidationError('Expected arguments to be an array');
//   },
//   () => '',
//   items =>
//     items.map((item, index) => {
//       if (!index) {
//         return isFirstRange(item);
//       }
//       if (index === items.length - 1) {
//         return isLastRange(item);
//       }
//
//       return isMiddleRange(item);
//     }),
//   () => '\n)',
// );

const GENERIC_ERROR = 'Invalid argument passed to defineSizeRanges:';
const GENERIC_ERROR_POST = 'Check the documentation of defineSizeRanges for more info';

function tryStringify(input: unknown): string {
  try {
    return JSON.stringify(input);
  } catch (e) {
    return '';
  }
}

const parserError = Symbol('parserError');

type ParserError = {
  [parserError]: true;
  errorMessage: string;
  errorValue?: string;
};

const createParserError = (errorMessage: string, errorValue?: string): ParserError => ({
  errorMessage,
  errorValue,
  [parserError]: true,
});

type ValueParsersArray = Array<ValueParser<any>>;
type ValueParsersGetter<TOutput, TValueParsers extends ValueParsersArray> = (
  output: TOutput,
) => TValueParsers;
type OutputOfValueParsers<T extends ValueParsersArray> = {
  [K in keyof T]: T[K] extends ValueParser<infer V> ? V : never
};
type ValueParsersOf<T extends Array<any>> = { [K in keyof T]: ValueParser<T[K]> };

type ParserResult<TOutput> = [ParserError | TOutput, string?];
type ValueParser<TOutput> = () => ParserResult<TOutput>;
type Parser<TInput, TOutput> = (
  value: TInput,
  head?: string,
  tail?: string,
) => ValueParser<TOutput>;

// type ParserFactory<TInput, TOutput, TValueParsers extends ValueParsersArray> = (
//   getChildParsers?: (output: TOutput) => TValueParsers,
// ) => Parser<TInput, TOutput>;

type ParserCheckResult<TOutput> = [ParserError | TOutput, string?, string?];
type ParserCheck<TInput, TOutput> = (i: TInput) => ParserCheckResult<TOutput>;

function isParserError(val: any): val is ParserError {
  return !!val[parserError];
}

const createParser = <
  TInput,
  TOutput extends TInput,
  TFinalOutput extends TOutput,
  TValueParsers extends ValueParsersArray
>(
  check: ParserCheck<TInput, TOutput>,
) => (getChildParsers?: (output: TOutput) => TValueParsers): Parser<TInput, TFinalOutput> => (
  value,
  parentHead = '',
  parentTail = '',
) => () => {
  const [result, head = '', tail = ''] = check(value);

  if (isParserError(result)) {
    const { errorMessage, errorValue } = result;
    return [
      {
        errorMessage,
        [parserError]: true,
        errorValue: errorValue === undefined ? tryStringify(value) : errorValue,
      },
      `${parentHead}${head}`,
    ];
  }

  const childParsers = getChildParsers ? getChildParsers(value as TOutput) : [];
  let stringified = `${parentHead}${head}`;
  for (const child of childParsers) {
    const [childResult, childStringified = ''] = child();

    stringified += childStringified;

    if (isParserError(childResult)) {
      return [{ ...childResult, [parserError]: true }, stringified];
    }
  }

  return [result as TFinalOutput, `${stringified}${tail}${parentTail}`];
};

const isArray = (length?: number) => ({
  parser<TValueParsers extends ValueParsersArray>(
    getChildParsers?: ValueParsersGetter<Array<any>, TValueParsers>,
  ) {
    return createParser<unknown, Array<any>, OutputOfValueParsers<TValueParsers>, TValueParsers>(
      val => {
        if (!Array.isArray(val)) {
          return [createParserError('Expected an array')];
        }

        if (length !== undefined && val.length !== length) {
          return [
            createParserError(`Expected an array of length ${length}, got ${val.length}`, '['),
          ];
        }

        return [val as OutputOfValueParsers<TValueParsers>, '[', ']'];
      },
    )(getChildParsers);
  },
});

const isArgsArray = <TValueParsers extends ValueParsersArray>(minLength?: number) => ({
  parser<TValueParsers extends ValueParsersArray>(
    getChildParsers?: ValueParsersGetter<Array<any>, TValueParsers>,
  ) {
    return createParser<unknown, Array<any>, OutputOfValueParsers<TValueParsers>, TValueParsers>(
      val => {
        if (!Array.isArray(val)) {
          return [createParserError('Expected an array')];
        }

        if (minLength !== undefined && val.length < minLength) {
          return [
            createParserError(
              `Expected at least ${length} number of arguments, got ${val.length}`,
              '(\n  ',
            ),
          ];
        }

        return [val as OutputOfValueParsers<TValueParsers>, '(\n', ')'];
      },
    )(getChildParsers);
  },
});

function validateArgs<TSizeName extends string>(args: DefineSizeRangesArgs<TSizeName>) {
  const [result, stringified = ''] = isArgsArray(2).parser(a => {
    const firstRangeParser = isArray(2).parser();
    const midRangeParser = isArray(3).parser();
    const lastRangeParser = isArray(2).parser();

    return [
      firstRangeParser(a[0], '  ', ',\n'),
      ...a.slice(1, -1).map((arg: unknown) => midRangeParser(arg, '  ', ',\n')),
      lastRangeParser(a[a.length - 1], '  ', '\n'),
    ];
  })(args)();

  if (isParserError(result)) {
    const errorLines = stringified.split('\n');
    const errorColumn = errorLines[errorLines.length - 1].length;

    throw new Error(
      `${GENERIC_ERROR}\ndefineSizeRanges${stringified}${result.errorValue || ''}\n${' '.repeat(
        errorColumn,
      )}^${result.errorMessage}\n\n${GENERIC_ERROR_POST}`,
    );
  }

  console.log(stringified);
}

export default function defineSizeRanges<TSizeName extends string>(
  ...args: DefineSizeRangesArgs<TSizeName>
): SizesConfig<TSizeName> {
  validateArgs(args);

  return {} as any;
}
