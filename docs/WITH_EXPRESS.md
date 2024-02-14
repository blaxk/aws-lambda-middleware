# with Express
Introducing a method that can be applied to the Express framework.  
> It can also be used in other frameworks.

&nbsp;

**middlewear.js**
```js
const { Middleware, Prop, Validate } = require('aws-lambda-middleware')


//Add custom validation rule
Validate.addRules({
  min: {
    valid: (value, option, sibling, event) => {
      return ...
    },
    message: `'{{propName}}' can be from {{min}}`
  }
})


exports.validator = (rules) => {
  const middlewear = new Middleware({ trim: true }).add(rules)

  return async (req, res, next) => {
    const { status, message } = middlewear.valid(req)

    if (['invalid', 'error'].includes(status)) {
      //Return data on error
      res.status(400).json({
        message
      })
    } else {
      next()
    }
  }
}

exports.Prop = Prop
```

**app.js**
```js
const { validator, Prop } = require('./middlewear')
const express = require('express')
const app = express()


app.get('/api/v1/users', validator({
  query: {
    username: Prop.string.required(),
    age: Prop.integer,
    limit: Prop.integer.default(10).max(50)
  }
}), (req, res, next) => {
  const query = req.query

  //code
})
```
