## Defining size ranges (JavaScript)

> Note: you are also able to use the [typescript specific syntax](./defining-ranges.md) if you prefer to do so. 

### Example syntax

Size ranges can be defined using the `defineRanges` utility. The function has the following syntax:

```js
defineRanges(
  'x_small < 600',
  '600 > small <= 768',
  '768 > medium <= 1024',
  '1024 > large <= 1920',
  '1920 > x-large',
);
```

### TODO
