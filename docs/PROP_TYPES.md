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

    //Only Type (not checked if there is no value)
    age: Prop.integer,

    //You can set a default value when there is no value in the request parameter.
    startDate: Prop.integer.default('2024-01-01'),

    //Since it is not a required item, length is checked only when there is a value. (Validate)
    info: Prop.string.length({ max: 20 }),
    
    //Validation of deep data is possible using "item()"
    //For detailed usage, see "item()" below.
    imagesB: [
			Prop.string.required()
		]
  }
})
```

## Support methods
> The methods below can set values both statically and dynamically.   
> Parameters use the `named parameters` format.   
>   @param *{\*}* `value`     
>   @param *{Object}* `sibling` Sibling elements at the same level   
>   @param *{Object}* `event` Lambda event object   
>   @param *{String}* `propName`

| Type | Type | Description |
| --- | --- | --- |
| default | *Function*| You can set a default value when there is no value in the request parameter. |
| item | *Function*| Sets child elements of Array or Object. |

```js
exports.handler = new Middleware().add({
  body: {
    //You can set a default value when there is no value in the request parameter
    startTime: Prop.integer.default(10),

    //Sets child elements of Array or Object.
    //If there is one rule in array.item and three values in the request parameter array, the three values are verified based on one rule.
    /**
     * Sets child elements of Array or Object.
     * - If there is one rule in array.item and three values in the request parameter array, the three values are verified based on one rule.
     * - If two rules are set, the first rule is applied to the third parameter.
     */
    imagesA: Prop.array.required().item([
      Prop.string.required()
    ]),
    
    //✨ param "imagesA" and "imagesB" are the same settings.
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
    ],


    //You can change the default value dynamically.
    startTime: Prop.integer.default(({ value, sibling, event, propName }) => Date.now()),

    //You can use parameters more briefly.
    startDate: Prop.string.default(({ v, s, e, p }) => s.startTime ? '2024-01-01'),

    //You can simplify the code by indicating only the necessary parameters.
    startDate: Prop.string.default(({ s }) => s.startTime ? '2024-01-01')
  }
})
```

&nbsp;

### addRules(rules)   
> In addition to the basic rules, new rules can be added.   
> Adding with the same type name overrides the existing rule.   
> This setting is applied globally.   
> Executed in the order `validType > validRequired > convert`.   

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
        //Valid function to check if it is required
        validRequired: (value) => {
          return !isNaN(value)
        },
        //A function that converts the value of Paramers when it is incorrectly converted to a string. (Set only when necessary)
        convert: (value) => {
          if (typeof value === 'string') {
            return Number(value)
          } else {
            return value
          }
        }
    })
  },

  //Multiple settings are possible at once
  get string () {
    return PropTypes.makeRule({ 
        validType: (value, isDefaultValue) => {
          return ...
        },
        validRequired: (value) => {
          return ...
        },
        convert: (value) => {
          return ...
        }
    })
  }
})
```