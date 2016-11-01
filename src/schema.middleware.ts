// TODO:
// https://github.com/spearhead-ea/island/blob/master/src/middleware/schema.middleware.ts

import translateSchemaType from './schema-types';
let inspector = require('schema-inspector');

export function sanitize(subschema, target) {
  if (!subschema) return target;
  translateSchemaType(subschema);
  let result = inspector.sanitize(subschema, target);
  return result.data;
}

export function validate(subschema, target) {
  if (!subschema) return {valid: true};
  translateSchemaType(subschema);
  let result = inspector.validate(subschema, target);
  return result;
}