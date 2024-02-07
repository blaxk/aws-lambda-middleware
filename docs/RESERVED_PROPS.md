# Reserved prop names

A rule cannot be added with that prop name. 

> 'addRules', 'makeRule', 'isEmpty', 'default', 'isRequired', 'option', 'array', 'object',   
> 'required', 'valid', 'item', 'items'

The name of the rule added to PropTypes cannot be added to the Validate rule.
The opposite cannot be added either.

```js
const { PropTypes, Validate } = require('aws-lambda-middleware')

//add date rule
PropTypes.addRules({
  get date () {
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

//🚫 Because a rule with the name "date" has already been added in PropTypes, "date" cannot be added to the Validate rule.
Validate.addRules({
	date: {
		valid: (value, option, sibling, event) => {
			return ...
		},
		message: `...`
	}
})
```