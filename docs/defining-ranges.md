## Defining size ranges (TypeScript)

> Note: these instructions will also work for JavaScript. However, if you're not using TypeScript, you may prefer the alternative syntax you can find [on this page](./defining-ranges-js.md)

### Example syntax

Size ranges can be defined using the `defineRanges` utility. The function has the following syntax:

```typescript
const ranges = defineRanges(
  ['x-small', '< 600'],
  ['600 >=', 'small', '< 768'],
  ['768 >=', 'medium', '< 1024'],
  ['1024 >=', 'large', '< 1920'],
  ['1920 >=', 'x-large']
);
```

This function is quite strict about the syntax you use (if you want to know why, there's more info [below](#Syntax-rationale)). It is recommended that you copy this example, and change the ranges to suit your needs. You can change the following:

 - ✅ You can change the boundary sizes of the ranges
 - ✅ The amount of ranges can be 2 or larger
 - ✅ You can pick any sizes name you want
 - ✅ You can change the whitespace around the `>=` and `<` signs
 - ✅ The numbers represent pixel values by default. You can instead add any CSS unit __except for %__
 
Other changes will result in an error being thrown. 

### Syntax rationale
You may wonder why `defineSizes` only accepts it's parameters in this exact format. There is some duplication here, so in theory there are shorter ways to declare the same ranges. 

The reason is that a shorter notation left room for interpretation, and was the cause of some confusion among users. This is most often the case when onboarding new developers, who may be unfamiliar with the syntax. For example, without the `<` and `>=` signs, it is not very clear if the numbers at the boundaries were part of the range or not.

The array notation is used so the TypeScript compiler can statically infer the names of your ranges. This allows for better code autocompletion in IDEs that support the TypeScript language service. If you're not using TypeScript, you may want to try the [javascript syntax](./defining-ranges-js.md).
 
### Detailed examples

#### `>=` and `<` characters

##### ❌ You cannot omit the `>=` and `<` characters
```typescript
const ranges = defineRanges(
  ['x-small', '600'],
  ['600', 'small', '768'],
  ['768', 'medium', '1024'],
  ['1024', 'large', '1920'],
  ['1920', 'x-large']
);
```

> 🤔 \
**Why?** Removing the characters hurts readability. Without them, it is unclear what range should be active when the element size is exactly on one of the boundaries 


##### ❌ You cannot use `>` and `<=` characters
```typescript
const ranges = defineRanges(
  ['x-small', '< 600'],
  ['600 >=', 'small', '<= 767'], // ❌ 
  ['767 >', 'medium', '<= 1023'], // ❌ 
  ['1024 >=', 'large', '< 1920'],
  ['1920 >=', 'x-large']
);
```

> 🤔 \
**Why?** Due to technical limitations, `SizeObserver` cannot match "greater than" or "smaller than or equal to" conditions without degrading performance

#### First and last range

##### ❌ You cannot include a lower bound on the first range
```typescript
const ranges = defineRanges(
  ['100 >=', 'small', '< 600'], // ❌ 
  ['600 >=', 'medium', '< 1000'],
  ['1000 >=', 'large']
);
```

##### ❌ You cannot include an upper bound on the last range
```typescript
const ranges = defineRanges(
  ['100 >=', 'small', '< 600'],
  ['600 >=', 'medium', '< 1000'],
  ['1000 >=', 'large'] // ❌ 
);
```

> 🤔 \
**Why?** This will make sure that there is always an active range, even on very small or very large elements

#### Range boundaries

##### ✅ You can choose the boundaries of each range
```typescript
const ranges = defineRanges(
  ['small', '< 600'],
  ['600 >=', 'medium', '< 1000'],
  ['1000 >=', 'large']
);
```

##### ❌ The ranges must be in the correct order
```typescript
const ranges = defineRanges(
  ['x-small', '< 600'],
  ['768 >=', 'medium', '< 1024'], // ❌ 
  ['600 >=', 'small', '< 768'], // ❌ 
  ['1024 >=', 'large', '< 1920'],
  ['1920 >=', 'x-large']
);
```

> 🤔 \
**Why?** You may want to compare sizes, such as `if (activeRange >= ranges.small) { … }`. This only works if the ranges are in order

##### ❌ You cannot leave gaps between the ranges
In the following example there is a gap of 100px between the sizes `"small"` and `"medium"`:
```typescript
const ranges = defineRanges(
  ['small', '< 600'], // ❌ 
  ['700 >=', 'medium', '< 1000'], // ❌
  ['1000 >=', 'large']
);
```

> 🤔 \
**Why?** Your code is most stable if `SizeObserver` always provides you with an active range. This is not possible if an element size is in a gap in between 2 ranges 

##### ❌ You cannot have overlap between the ranges
In the following example there is overlap `"x-small"` and `"medium"`:
```typescript
const ranges = defineRanges(
  ['x-small', '< 650'], // ❌ 
  ['600 >=', 'medium', '< 1000'], // ❌
  ['1000 >=', 'x-large']
);
```

> 🤔 \
**Why?** It is ambiguous which range should be active on overlapping sizes 

#### Number or ranges

##### ✅ You are allowed to define only 2 ranges
```typescript
const ranges = defineRanges(
  ['small', '< 100'],
  ['100 >=', 'large']
);
```

##### ❌ You cannot define less than 2 ranges
```typescript
const ranges = defineRanges(
  ['100 >', 'large']
);
```

> 🤔 \
**Why?** There is no need for a `SizeObserver` if there is only one possible size

#### Range names

##### ✅ You can choose whatever names you want

_(obviously you cannot use the same name twice)_

```typescript
const ranges = defineRanges(
  ['tiny', '< 10'],
  ['10 >=', 'standard', '< 1000'],
  ['1000 >=', 'enormous']
);
```

#### Whitespace

##### ✅ You can change the whitespace in the boundry strings

```typescript
const ranges = defineRanges(
  ['tiny', '<10'],
  ['10  >=  ', 'standard', '<    1000'],
  ['1000>= ', 'enormous']
);
```

#### Alternative units

##### ✅ You can explicitly postfix sizes with `px`

As `px` is the default, this is effectively the same as the example at the top of this page:

```typescript
const ranges = defineRanges(
  ['x-small', '< 600px'],
  ['600px >=', 'small', '< 768px'],
  ['768px >=', 'medium', '< 1024px'],
  ['1024px >=', 'large', '< 1920px'],
  ['1920px >=', 'x-large']
);
```

##### ✅ You can use alternative units

Such as: `em`, `rem` and `vw` 

```typescript
const ranges = defineRanges(
  ['small', '< 30vw'],
  ['30vw >=', 'regular']
);
```

##### ❌ You cannot use `%`

```typescript
const ranges = defineRanges(
  ['small', '< 10%'],
  ['10% >=', 'regular', '< 50%'],
  ['50% >=', 'large']
);
```

> 🤔 \
**Why?** Because of how `SizeObserver` works under the hood, `%` sizes are relative to the observed element itself. This would mean that the active size is always `100%` 

##### ❌ You cannot mix units

```typescript
const ranges = defineRanges(
  ['small', '< 10rem'],
  ['100px >=', 'regular']
);
```

> 🤔 \
**Why?** `SizeObserver` is unable to compare sizes of different units
