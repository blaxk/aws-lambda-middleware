# PropTypes
Checks and corrects the data types of request parameters.
> `PropTypes` and `Prop` are the same object.   

&nbsp;

## Support rules
> `object` and `array` must have at least one child element to be checked as "required", so they must be used with caution.

| Type | Description | Modify |
| --- | --- | --- |
| string | String | Y |
| number | Number or Numberic string | Y |
| integer | Integer or Integeric string | Y |
| bool | Boolean or Boolean string | Y |
| array | Array, required = array.length > 0 | N |
| object | Object, required = object.length > 0 | N |

```js
exports.handler = new Middleware().add({
  //Validate child property of Lambda event (queryStringParameters, body, pathParameters ...)
  queryStringParameters: {
    //Type + Required
    username: Prop.string.required(),
    //⚠️ "isRequired" is a feature for backwards compatibility.
    //Replaced by the "required()" function, which allows you to set various options.
    friends: Prop.array.isRequired,
    //Only Type (Do not check when there is empty value)
    age: Prop.integer,
    //The value returned by the function can be set as the default value.
    startTime: Prop.integer.default((sibling, event) => Date.now()),
    //Validation of deep data is possible using "item()"
    photos: Prop.array.required().item([
      Prop.string.required()
    ]),

    //✨ param "imagesA" and "imagesB" are the same settings.
    imagesA: Prop.array.required().item([
      Prop.string.required()
    ]),
    
    //"item()" can be replaced with Array and Object expressions for brevity.
    imagesB: [
			Prop.string.required()
		],
    
    //Array and Object allow deep data validation with more concise expressions.
    friends: [
      {
        name: Prop.string.length({ max: 20 }),
        gender: Prop.string.or(['male', 'female'])
      }
    ]
  }
})
```

### addRules(rules)   
> In addition to the basic rules, new rules can be added.   
> Adding with the same type name overrides the existing rule.   
> This setting is applied globally.   

[⚠️ Rules that cannot be added to PropTypes](RESERVED_PROPS.md)

| Param | Type | Description |
| --- | --- | --- |
| rules | *Object* | - |

```js
const { PropTypes } = require('aws-lambda-middleware')

PropTypes.addRules({
  //It overrides the existing string rule.
  get number () {
    return PropTypes.makeRule({
        /**
         * Valid function to check data type
         * @param {*}		value
         * @param {Boolean}	isDefaultValue	 Returns true when validating the value type set as the default.
         * */
        validType: (value, isDefaultValue) => {
          if (!isDefaultValue && typeof value === 'string') {
            return /^-*[0-9]*[\.]*[0-9]+$/.test(value) && !/^0[0-9]+/.test(value) && !/^-0[0-9]+/.test(value) && !(value.length === 1 && value === '-')
          } else {
            return typeof value === 'number'
          }
        },
        //A function that converts the value of Paramers when it is incorrectly converted to a string. (Set only when necessary)
        convert: (value) => {
          if (typeof value === 'string') {
            return Number(value)
          } else {
            return value
          }
        },
        //Valid function to check if it is required
        validRequired: (value) => {
          return !isNaN(value)
        }
    })
  },

  //Multiple settings are possible at once
  get string () {
    return PropTypes.makeRule({ 
        validType: (value, isDefaultValue) => {
          return ...
        },
        convert: (value) => {
          return ...
        },
        validRequired: (value) => {
          return ...
        }
    })
  }
})
```