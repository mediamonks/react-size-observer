import * as lib from '../src';

type UntypeArgs<F extends (...args: Array<any>) => any> = F extends (...args: Array<any>) => infer R
  ? (...args: Array<any>) => R
  : never;

const defineSizeRanges = lib.defineSizeRanges as UntypeArgs<typeof lib.defineSizeRanges>;

describe('defineSizeRanges()', () => {
  describe('validation', () => {
    test('should error on no parameters', () => {
      const ranges = defineSizeRanges(
        ['x-small', '< 600'],
        ['600 >=', 'small', '<= 768'],
        ['768 >=', 'medium', '< 1024'],
        ['1024 >=', 'large', '< 1920'],
        ['1920 >=', 'x-large']
      );

      expect(ranges).toBeDefined();
    });
  });
});
