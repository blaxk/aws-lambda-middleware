# Validate
It only verifies the validity of the request parameter value.
> You can use it by adding custom rules.   

&nbsp;

## Support rules

| Rule | Supported | Options | Description |
| --- | --- | --- | --- |
| length | *string*, *array*, *object* | value or { min, max }, function | Set the allowable length |
| min | *number*, *integer* | value, function | Minimum |
| max | *number*, *integer* | value, function | Maximum |
| or | *number*, *integer*, *string*, *bool* | [val, val2,...], function | data set in the option array is allowed |
| digit | *string* |  | strings 0-9 are allowed |
| alphabet | *string* | `lower`, `upper`, function | alphabets are allowed |
| alphaDigit | *string* | `lower`, `upper`, function | alphabets + 0-9 allowed |
| valid | * | function | Dynamically check validity |


```js
exports.handler = new Middleware().add({
  body: {
    //Only length of 10 is allowed.
    param: Prop.string.length(10),
    //It is allowed if length is greater than 1.
    param: Prop.string.length({ min: 1 }),
    //It is allowed if length is less than 10.
    param: Prop.string.length({ max: 10 }),
    //Allowed if length is 3 ~ 10.
    param: Prop.string.length({ min: 3, max: 10 }),
    
    //min, max
    param: Prop.number.min(10).max(20),

    //or
    param: Prop.string.or(['male', 'female']),

    //digits
    param: Prop.string.digit(),

    //alphabet lower + upper case
    param: Prop.string.alphabet(),
    //alphabet lower case
    param: Prop.string.alphabet('lower'),
    //alphabet upper case
    param: Prop.string.alphabet('upper'),

    //alphabet + digit
    param: Prop.string.alphaDigit(),
    param: Prop.string.alphaDigit('lower'),
    param: Prop.string.alphaDigit('upper'),

    //You can dynamically verify validity using the "valid" function.
    param: Prop.string.valid(({ v }) => v === 'male'),

    //🚀All validate options can be set dynamically.
    param: Prop.string.or(({ value, sibling, event, propName }) => sibling.storeType === 'market' ? ['S', 'L'] : ['S', 'M', 'L']),
    //You can use parameters more briefly.
    param: Prop.string.or(({ v, s, e, p }) => s.storeType === 'market' ? ['S', 'L'] : ['S', 'M', 'L']),
    //You can simplify the code by indicating only the necessary parameters.
    param: Prop.string.or(({ s }) => s.storeType === 'market' ? ['S', 'L'] : ['S', 'M', 'L'])
  }
})
```

&nbsp;

### addRules(rules)
> In addition to the basic rules, new rules can be added.   
> Adding with the same type name overrides the existing rule.   
> This setting is applied globally.   

[⚠️ Rules that cannot be added to Validate](RESERVED_PROPS.md)

| Param | Type | Description |
| --- | --- | --- |
| rules | *Object* | - |

The error message of the Validate rule can be configured as a template.   
[Configuring error message templates](MESSAGE.md)


```js
const { Validate } = require('aws-lambda-middleware')

Validate.addRules({
  /**
   * @param {Number | Int} 	value 
   * @param {Object | *} 	option 
   * @param {Object} 	sibling 
   * @param {Object} 	event   lambda event object 
   */
  min: {
    valid: (value, option, sibling, event) => {
      const val = common.isNumber(value) ? value : 0
      return val >= option
    },
    //error message template
    message: `'{{propName}}' can be from {{min}}`
  },

  //It is also possible to change just the message in an existing rule.
  max: {
    message: `'{{propName}}' can be up to {{max}}`
  }
})
```