import { SizesConfig } from './types';

type DefineSizeRangesArgs<T> = [[T, string], ...Array<[string, T, string?]>];

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

type ValueParserGetter<T> = (prevResults: Array<any>) => ValueParser<T>;
type ValueParserGetterArray = Array<ValueParserGetter<any>>;
type ValueParsersGetter<TOutput, TValueParsers extends ValueParserGetterArray> = (
  output: TOutput,
) => TValueParsers;
type OutputOfValueParsers<T extends ValueParserGetterArray> = {
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

type ParserCheckResult<TOutput> = [ParserError | TOutput, string?, string?];
type ParserCheck<TInput, TOutput> = (i: TInput) => ParserCheckResult<TOutput>;

function isParserError(val: any): val is ParserError {
  return !!val[parserError];
}

const createParser = <
  TInput,
  TOutput extends TInput,
  TFinalOutput,
  TValueParsers extends ValueParserGetterArray
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

  const childParserGetters = getChildParsers ? getChildParsers(value as TOutput) : [];

  const childReduceResult = [[], `${parentHead}${head}`] as [Array<any>, string];
  for (const getChildParser of childParserGetters) {
    const [childValues, stringified] = childReduceResult;
    const childParser = getChildParser(childValues);
    const [childResult, childStringified = ''] = childParser();

    if (isParserError(childResult)) {
      return [childResult, `${stringified}${childStringified}`];
    }

    childReduceResult[0] = [...childValues, childResult];
    childReduceResult[1] = `${stringified}${childStringified}`;
  }

  const [childValues, stringified] = childReduceResult;

  return [
    ((getChildParsers ? childValues : result) as unknown) as TFinalOutput,
    `${stringified}${tail}${parentTail}`,
  ];
};

const isArray = (length?: number) => <TValueParsers extends ValueParserGetterArray>(
  getChildParsers?: ValueParsersGetter<Array<any>, TValueParsers>,
) =>
  createParser<unknown, Array<any>, OutputOfValueParsers<TValueParsers>, TValueParsers>(val => {
    if (!Array.isArray(val)) {
      return [createParserError('Expected an array')];
    }

    if (length !== undefined && val.length !== length) {
      return [createParserError(`Expected an array of length ${length}, got ${val.length}`, '[')];
    }

    return [val as OutputOfValueParsers<TValueParsers>, '[', ']'];
  })(getChildParsers);

const isArgsArray = <TValueParsers extends ValueParserGetterArray>(minLength?: number) => <
  TValueParsers extends ValueParserGetterArray
>(
  getChildParsers?: ValueParsersGetter<Array<any>, TValueParsers>,
) =>
  createParser<unknown, Array<any>, OutputOfValueParsers<TValueParsers>, TValueParsers>(val => {
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
  })(getChildParsers);

type ParsedCSSValue = [number, string?];

const lowerBoundRegex = /^([0-9]+)(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?\s*>=\s*$/;
const isLowerBound = (previousUpperBound: ParsedCSSValue) =>
  createParser<unknown, ParsedCSSValue, ParsedCSSValue, never>(value => {
    if (typeof value === 'string') {
      const match = value.match(lowerBoundRegex);
      if (match) {
        if (match[2] !== previousUpperBound[1]) {
          return [
            createParserError(
              `Lower bound unit "${match[2] ||
                ''}" is different than preceding upper bound unit "${previousUpperBound[1] || ''}"`,
              value,
            ),
            '"',
          ];
        }
        const cssInt = parseInt(match[1], 10);
        if (cssInt !== previousUpperBound[0]) {
          return [
            createParserError(
              `Lower bound "${match[1]}${match[2] || ''}" doesn't match preceding upper bound "${
                previousUpperBound[0]
              }${previousUpperBound[1] || ''}"`,
              value,
            ),
            '"',
          ];
        }

        return [match[2] ? [cssInt, match[2]] : [cssInt], JSON.stringify(value)];
      }
      return [
        createParserError(`Expected a lower bound string. For example: "123 >="`, value),
        '"',
      ];
    }
    return [createParserError(`Expected a lower bound string. Got type ${typeof value}`)];
  });

const upperBoundRegex = /^\s*<\s*([0-9]+)\s*(rem|em|px|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)?$/;
const isUpperBound = createParser<unknown, ParsedCSSValue, ParsedCSSValue, never>(value => {
  if (typeof value === 'string') {
    const match = value.match(upperBoundRegex);
    if (match) {
      const cssInt = parseInt(match[1], 10);
      return [match[2] ? [cssInt, match[2]] : [cssInt], JSON.stringify(value)];
    }
    return [createParserError(`Expected an upper bound string. For example: "< 500"`, value), '"'];
  }
  return [createParserError(`Expected an upper bound string. Got type ${typeof value}`)];
});

const isName = createParser<unknown, string, string, never>(value => {
  if (typeof value === 'string') {
    return [value, JSON.stringify(value)];
  }

  return [createParserError(`Expected a range name string. Got type ${typeof value}`)];
});

function validateArgs<TSizeName extends string>(args: DefineSizeRangesArgs<TSizeName>) {
  const [result, stringified = ''] = isArgsArray(2)(a => {
    const firstRangeParser = isArray(2)(range => {
      return [() => isName()(range[0], '', ','), () => isUpperBound()(range[1], '', '')];
    });

    return [
      () => firstRangeParser(a[0], '  ', ',\n'),
      ...a.slice(1, -1).map((arg: unknown, index) => {
        return (previousRanges: Array<any>) =>
          isArray(3)(range => {
            const previousRange = previousRanges[index];
            return [
              () => isLowerBound(previousRange[previousRange.length - 1])()(range[0], '', ','),
              () => isName()(range[1], '', ','),
              () => isUpperBound()(range[2], '', ''),
            ];
          })(arg, '  ', '\n');
      }),
      previousRanges =>
        isArray(2)(range => {
          const previousRange = previousRanges[a.length - 2];
          return [
            () => isLowerBound(previousRange[previousRange.length - 1])()(range[0], '', ','),
            () => isName()(range[1], '', ','),
          ];
        })(a[a.length - 1], '  ', '\n'),
    ];
  })(args)();

  if (isParserError(result)) {
    const errorLines = stringified.split('\n');
    const errorColumn = errorLines[errorLines.length - 1].length;
    const { errorMessage, errorValue = '' } = result;

    throw new Error(
      `${GENERIC_ERROR}\ndefineSizeRanges${stringified}${errorValue || ''}\n${' '.repeat(
        errorColumn,
      )}${'^'.repeat(Math.max(1, errorValue.length))} ${errorMessage}\n\n${GENERIC_ERROR_POST}`,
    );
  }

  console.log(stringified);
  console.log(JSON.stringify(result, null, '  '));
}

export default function defineSizeRanges<TSizeName extends string>(
  ...args: DefineSizeRangesArgs<TSizeName>
): SizesConfig<TSizeName> {
  validateArgs(args);

  return {} as any;
}
