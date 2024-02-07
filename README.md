# aws-lambda-middleware

[![NPM version](https://img.shields.io/npm/v/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)
[![NPM downloads](https://img.shields.io/npm/dm/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)

#### AWS Lambda Middleware  
You can simply apply Middleware in Lambda.       
Clean code split is possible, and it includes a simple and extensible Parameter PropTypes validater.  
It is implemented as lightly as possible to reduce the burden when running Lambda.   

> **v1.0 added features**   
> A Validate function that is easy to expand and use has been added, and deep data of arrays and objects can now be processed.   
> 
> It is compatible even in environments other than lambda. (node express etc.)    

&nbsp;

## Install

```bash
npm i aws-lambda-middleware
```
&nbsp;

## Quick setting
```js
const { Middleware, Prop } = require('aws-lambda-middleware')


exports.handler = new Middleware().add({
  queryStringParameters: {
      username: Prop.string.required(),
      age: Prop.integer,
      friends: [
        {
          name: Prop.string.length({ max: 20 }),
          gender: Prop.string.or(['male', 'female'])
        }
      ]
  }
}).add(async (event, context, prevData) => {
  const query = event.queryStringParameters

  //your code

  return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'success'
      })
  }
})
```

&nbsp;

## Options
You can set global options and cluster options.  
> You can set options such as `trim`.   

[📖 Options detail docs](docs/OPTIONS.md)

## Middleware
You can simply apply Middleware in Lambda.   

[📖 Middleware detail docs](docs/MIDDLEWEAR.md)

## PropTypes
Checks and corrects the data types of request parameters.    
> `PropTypes` and `Prop` are the same object.   

[📖 PropTypes detail docs](docs/PROP_TYPES.md)

## Validate
It only verifies the validity of the request parameter value.   
> You can use it by adding custom rules.   

[📖 Validate detail docs](docs/VALIDATE.md)

&nbsp;

The rules added to PropTypes and Validate are written in one line and used.

![code](https://github.com/blaxk/aws-lambda-middleware/assets/16889775/519de528-3cf3-4c70-9695-c9c1f72e81ee)

&nbsp;

## Upgrading from v0.9 to v1.0
...