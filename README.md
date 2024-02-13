# aws-lambda-middleware

[![NPM version](https://img.shields.io/npm/v/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)
[![NPM downloads](https://img.shields.io/npm/dm/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)

#### AWS Lambda Middleware  
You can simply apply Middleware in Lambda.       
Clean code split is possible, and it includes a simple and extensible Parameter PropTypes validater.  
It is implemented as lightly as possible to reduce the burden when running Lambda.   

> **🚀 v1.0 added features**   
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

<img src="https://github.com/blaxk/aws-lambda-middleware/assets/16889775/519de528-3cf3-4c70-9695-c9c1f72e81ee" alt="code" style="max-width: 300px;">

&nbsp;

## ⚠️ Upgrading from v0.9 to v1.0

### 1. `object` and `array` expressions
`object` and `array` are designated as reserved prop name, so the rule cannot be overwritten.     

[⚠️ Reserved prop names](docs/RESERVED_PROPS.md)

### 2. Option settings for each PropTypes
trim settings for each PropTypes use `.option()`.   
```js
{
  param: Prop.string.option({ trim: false })
}
```

### 3. `PropTypes` and `Prop`
The abbreviated `Prop` can be used instead of the `PropTypes`.     
`PropTypes` can still be used as well.   

### 4. `.isRequired` has been replaced by `.required()`.   
`.isRequired` is also compatible, but not recommended.    

### 5. Parameter type of PropTypes.*.default() function
When dynamically setting the default value of PropTypes, the parameter type has been changed to `named parameters`.   

**~ v0.9**   
```js
Prop.*.default((event) => {})
```

**v1.0 ~**   
```js
Prop.*.default(({ event }) => {})
```

[📖 PropTypes > Support methods](docs/PROP_TYPES.md?tab=readme-ov-file#support-methods)


### 6. Interpreting `object` and `array` expressions
The interpretation of Object and Array expressions has been changed from `validate only when value exists` to `required validation`.   
When setting the body as shown below, the returned status depends, so check the `item` document in `PropTypes > Support methods`.   

[📖 PropTypes > Support methods](docs/PROP_TYPES.md?tab=readme-ov-file#support-methods)

```js
exports.handler = new Middleware().add({
  body: {
    myId: Prop.string
  }
})
```

**v0.9**   
Even if the body of the request parameter is an empty Object or has no value, `status = 200` is returned.   

**v1.0**   
If the body of the request parameter is an empty Object or has no value, `status = 400` is returned.   
In order to `validate only when value exists` for the body, you must also set PropTypes on the body.

```js
exports.handler = new Middleware().add({
  body: Prop.object.item({
    myId: Prop.string
  })
})
```

