# alert

Setup
express: npm init (index.js, UNLICENSED)

typescript: npm i -D typescript

(template for tsconfig file)
typescript: npm install --save-dev @tsconfig/node14

(https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md)
(https://eslint.org/blog/2019/01/future-typescript-eslint)
eslint: npm i --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin

(https://github.com/iamturns/eslint-config-airbnb-typescript)
eslint: npm install eslint-config-airbnb-typescript --save-dev

(Check which versions are required. See output of previous command. Maybe installing without versions?)
eslint: npm install eslint-plugin-import@^2.22.1 --save-dev
eslint: npm install eslint-plugin-jsx-a11y@^6.4.1 --save-dev
eslint: npm install eslint-plugin-react@^7.21.5 --save-dev
eslint: npm install eslint-plugin-react-hooks@^4.2.0 --save-dev

(https://prettier.io/docs/en/install.html)
prettier: npm install --save-dev --save-exact prettier

(https://github.com/prettier/eslint-config-prettier#installation)
prettier: npm install --save-dev eslint-config-prettier

(https://thesoreon.com/blog/how-to-set-up-eslint-with-typescript-in-vs-code)
vs-code: "eslint.validate": ["typescript", "typescriptreact"]


Guideline
(https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
You’ll see that there are two syntaxes for building types: Interfaces and Types. You should prefer interface. Use type when you need specific features.

(https://www.typescriptlang.org/play?ssl=42&ssc=1&pln=46&pc=55&e=83#code/PTAEBUAsFMCdtAQ3qALgdwPagLaIJYB2ammANgM4mgAm0AxmcgqjKBZIgA4KYBmSQgFgAUCFCYARgCsGqAFygiqOH0T1oVRIRpoAnjyRl8iCpoB0okFbBRoepCgBucBxXw58TWABpBuvkxYNDYcTApUUHpMHDDielNNGyR6SNYECkQcaEsRUVQDBAAhfFgacELQAF5QAG9RUFB0IgBzCkUAJgBuUQBfHryRZVV1YtKaAElCFVg1DTqGptb20G6+0VFowgjQSXGARkUSsorDGtqlwjbO0H7NzG3IvbKOo-GpmbmEc8vr1duBskigxEABXMwQQoAZXosHwXEi+C07FQsFBqVBsEQZH0hgoegi0BwPmS+FQAHIqFxwu5JGQWNhhrBPAAPELQUqgcEMzC5e6PXbjADMbzKHxG8xqzxo+0BYlsMAckkwrHYoK41NgkWgLJUOlaEnSwSZXy0OlxFmSpwQ2JMZioNGwrCRoCcJiU0zgZlS+AeFoofnQkC80FJntmoyonBcSFAAGt7FgynyRAVDAB5dA4n6ETAY2CEbGKVGghC9UAAMlAx3KhQGaYQACUpERqnVQLn84WyIo1JQy5Xq+9w185SbRqAAArQdR5uOgHV6mhUGvWhYiRrRMiYTF8UE9tBo6ADRp8YyaXvYswDXqicfzADCwfoCeIi+gOhXw8+E-qG6i5A7rM+6Xv2J6gGe+AXhBV7Husgz0pEmBZoombZu2zRXCsHR+J2qCYt2xZHgCoiIVEz6vooT74C+H5thcmF-DhAHbruIEwf2fiQdBfYQncgziFAiCRJk+A0IGCDwNEsQfroeg7lyEL3poEguMEDbJLaiQUOYoBQjw9D4HwNHYmQeh+JIILcqA8mgksZA4i00BPM5MwLrAsBBMk2QUJkTk6aAEwCLZoCQJgamqXA7IQeQ26Me5nmwAGNkKQkwjyuw0AIGF6CQjwMJwgiUTaKAXCeW6dBoF6UXaLoYQoIE9DcjQ3maH5KlBnRSZxgazSqspVDGAmoDUbRhApsh6H0BRH4DNNNGvm2k1yuI6aEAgeDSEEtBGXwcAfvMlkYFlxANkYdoqU4VADZpKCsMJHo-hoWgoJgPDELVFrndpjgIIw4TQDQuSCcGVDZNoVAhWlC66rJgiPRKCCSA4dCMMgBpkppmVbLoqAeDkGxDCOE4ANJknq66NFwmJJYoyrkDOhA3oTymgGTqAU3+m6AZiigRHCVzMwJYBTNFKowMECQQogX1pbmLnkdoTm6DuqDuJV-CkmrtAMN4wm+uNhNnZO6pcA45yLFuQR86irQ3nKxum+blMkASiiEKCOCWbA9uE+IAAi0DvTQBp+rZwQtJgV5+M6Dq7fthDzNE+66JZSDJNS7h4zG20y+tLT6y4ukABLIdAEWBME1N0jRZkw5ngPJA2yVkpSsZHW5CQOdQeDDekODw8pKaretEgCOkuyaJE8AUEBz0xcEZgclcRg4vw0WA05yRSypyA7uazeutdxPPTHoMouo87haocVN5A8CILoLoy5HmC6FwTDzKg2ARMgCh+2ASAHMuDtBAL-F819ZhxXMNJYAABHUsEQDYUGAEKAA7B0IU6ChQAFZgDN1hPCVAABaAaxCrrEObsAHBHQABsAAODoTCAAMABiGhDCmEdGYaIIAA)
// That said, we recommend you use interfaces over type
// aliases. Specifically, because you will get better error
// messages. If you hover over the following errors, you can
// see how TypeScript can provide terser and more focused
// messages when working with interfaces like Chicken.

(https://martinfowler.com/bliki/EvansClassification.html)
Entity Classification

(https://blog.cleancoder.com/uncle-bob/2016/01/04/ALittleArchitecture.html)
Clean Code Architecture

(https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined)
ADD CODING GUIDELINES


Interface starting with 'I' if it is describing a class interface
Interface over type. type only for specific purposes like union type
const and let with type description for complex types or where type is not initially clear
if one line then do it (like 'if' things)
include public