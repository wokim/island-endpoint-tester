import * as island from 'island';
import * as _ from 'lodash';
import deprecate from 'deprecated-decorator';

import { sanitize, validate } from './schema.middleware';
import * as qs from 'qs';
import { compileURL, matchURL } from './router';

type MethodTypes = 'GET' | 'PUT' | 'POST' | 'DEL';

export interface Endpoint {
  name: string,
  options: island.EndpointOptions,
  method: string
}

export interface Input {
  body?: any;
  session?: any;
  result?: any;
}

export interface Output {
  body?: any;
  session?: any;
  result?: any;
  query?: any;
  params?: any;
}

export class Tester {
  private static endpoints: {[method: string]: Endpoint[]} = {};
  private static installed = false;
  private static origin: {_module?, method?} = {};

  static install(islandModule: typeof island): void {
    if (Tester.installed) return;

    // save previous
    Tester.origin._module = islandModule;
    Tester.origin.method = islandModule.endpointController;

    // install
    islandModule.endpointController = registerer => {
      return target => {
        const e = _.map(target._endpointMethods, (v: any) => {
          const splits = (v.name as string).split(' ');
          return {
            name: splits[1],
            options: v.options as island.EndpointOptions,
            method: splits[0]
          };
        });
        const endpoints = _.groupBy(e, 'method');
        _.mergeWith(Tester.endpoints, endpoints, (target, src) => {
          if (_.isArray(target)) return target.concat(src);
        });
      };
    };
    Tester.installed = true;
  }

  static uninstall() {
    if (!Tester.installed) return;

    // revert
    Tester.origin._module.endpointController = Tester.origin.method;
    Tester.origin = {};
    Tester.endpoints = {};
    Tester.installed = false;
  }

  @deprecate({ version: '2.0.0' })
  static register(_: any) {
  }

  private static splitUri(uri: string) {
    const splits = uri.split('?');
    const path = splits[0];
    // https://github.com/spearhead-ea/island/blob/5153829c2f9bcd09e0a53cb82d764702b6518cf0/src/adapters/impl/middlewares/restify-query-parser.ts#L10
    const query = qs.parse(splits[1], {allowDots: true});
    return {path, query};
  }

  static GET(uri: string, input: Input, sanitizeOnly = false) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('GET', splits.path, {
      query: splits.query,
      body: {},
      session: input.session,
      result: input.result
    }, sanitizeOnly);
  }

  static PUT(uri: string, input: Input, sanitizeOnly = false) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('PUT', splits.path, {
      query: splits.query,
      body: input.body,
      session: input.session,
      result: input.result
    }, sanitizeOnly);
  }

  static POST(uri: string, input: Input, sanitizeOnly = false) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('POST', splits.path, {
      query: splits.query,
      body: input.body,
      session: input.session,
      result: input.result
    }, sanitizeOnly);
  }

  static DEL(uri: string, input: Input, sanitizeOnly = false) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('DEL', splits.path, {
      query: splits.query,
      body: {},
      session: input.session,
      result: input.result
    }, sanitizeOnly);
  }

  private static execute(method: MethodTypes, path: string,
                         input: Input & {query?: any, params?: any},
                         sanitizeOnly: boolean): Output {
    const target = _.find(Tester.endpoints[method], endpoint => {
      const re = compileURL({url:endpoint.name});
      const res = matchURL(re, path);
      if (res) input.params = res;
      return res;
    }) as Endpoint;

    if (!target) throw new Error(`invalid uri ${method} ${path}`);

    let results: Output = {};
    for (const name of ['query', 'body', 'session', 'result', 'params']) {
      const schema: {sanitization: any, validation: any} = target.options.schema[name];
      if (!schema || !input[name]) continue;
      const sanitized = sanitize(schema.sanitization, input[name]);
      if (!sanitizeOnly) {
        const r = validate(schema.validation, sanitized);
        if (!r.valid) throw new Error(`${sanitized} validation failed ${JSON.stringify(r.error)}`);
      }
      results[name] = sanitized;
    }
    return results;
  }
}
