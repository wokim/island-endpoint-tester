// TODO
// https://github.com/spearhead-ea/island/blob/master/src/middleware/schema-types.ts

import * as _ from 'lodash';

let translators = {
  object: schema => _.forEach(schema.properties, v => translateSchemaType(v)),
  array: schema => translateSchemaType(schema.items),
  $oid: schema => {
    schema.type = 'string';
    schema.pattern = /^[a-f\d]{24}$/i;
  },
  $cider: schema => {
    schema.type = 'string';
    schema.pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(\d|[1-2]\d|3[0-2]))$/;
  },
  $numberOrQuery: schema => {
    schema.type = ['object', 'number'];
    schema.optional = true;
    schema.someKeys = ['$lte', '$gte', '$lt', '$gt'];
    schema.properties = {
      '$lte': { type: 'number', optional: true },
      '$gte': { type: 'number', optional: true },
      '$lt': { type: 'number', optional: true },
      '$gt': { type: 'number', optional: true }
    };
    schema.exec = (schema, post) => (typeof post === 'string' && /^[0-9]+$/.test(post)) ? parseInt(post, 10): post;
  }
};

export default function translateSchemaType(schema) {
  schema && (translators[schema.type] || (() => {}))(schema);
}