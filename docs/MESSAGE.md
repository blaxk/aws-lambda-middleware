# Message
Error messages can be organized into templates.
> The template supports `#unless` and `#less` conditional statements.   

&nbsp;

## 🚀Default error message
> Error message templates support `propName` and `value` variables.

| Key | Template | Description |
| --- | --- | --- |
| param-required | '{{propName}}' is a required parameter | |
| param-invalid-type | '{{propName}}' is a parameter in an invalid type | |
| error-default-func | {{propName}}' default function execution error | |
| error-default-value | '{{propName}}' default value type error | |
| validate-invalid-func | '{{propName}}' is an invalid value | .valid() error message |
| validate-default-invalid | value of '{{propName}}' invalid | validate default error message |

&nbsp;

### setTemplate(templateKey, template)
> You can modify the default error message template.   
> This setting is applied globally.  

| Param | Type | Description |
| --- | --- | --- |
| templateKey | *String* | - |
| template | *String* | - |

```js
const { Message } = require('aws-lambda-middleware')

Message.setTemplate('param-required', `'{{propName}}' is a required parameter`)
```

&nbsp;

## 🚀Validate error message
> Error message templates support `propName`, `value`, `option`, and option `key` variables.     

`#unless`, `#less` conditional statements.   

```
length of '{{propName}}'{{#unless max}} can be from {{#unless min}}{{min}} {{/unless}}~ {{max}}{{/unless}}{{#less max}} must be {{option}}{{/less}}
```