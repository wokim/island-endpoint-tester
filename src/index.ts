import * as island from 'island';
import * as _ from 'lodash';
import { sanitize, validate } from './schema.middleware';
import * as qs from 'qs';
import { compileURL, matchURL } from './router';

type MethodTypes = 'GET' | 'PUT' | 'POST' | 'DEL';

export class Tester {
  private static endpoints: {[method: string]: {name: string, options: island.EndpointOptions, method: string}[]} = {};
  static install(islandModule: typeof island): void {
    islandModule.endpointController = registerer => {
      return target => {
        const result = _.map(target._endpointMethods, (v: any) => {
          const splits = (v.name as string).split(' ');
          return {
            name: splits[1],
            options: v.options as island.EndpointOptions,
            method: splits[0]
          };
        });
        Tester.endpoints = _.groupBy(result, 'method');
      };
    };
  }

  static register(controller: typeof island.AbstractController) {
    const rpcService = new island.RPCService();
    rpcService.register = Promise.resolve() as any;
    new controller(rpcService);
  }

  private static splitUri(uri: string) {
    const splits = uri.split('?');
    const path = splits[0];
    // https://github.com/spearhead-ea/island/blob/5153829c2f9bcd09e0a53cb82d764702b6518cf0/src/adapters/impl/middlewares/restify-query-parser.ts#L10
    const query = qs.parse(splits[1], {allowDots: true});
    return {path, query};
  }

  static GET(uri: string, session?: any, result?: any) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('GET', splits.path, splits.query);
  }

  static PUT(uri: string, body?: any, session?: any, result?: any) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('PUT', splits.path, splits.query, body, session);
  }

  static POST(uri: string, body?: any, session?: any, result?: any) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('POST', splits.path, splits.query, body, session);
  }

  static DEL(uri: string, session?: any, result?: any) {
    const splits = Tester.splitUri(uri);
    return Tester.execute('DEL', splits.path, splits.query, session);
  }

  private static execute(method: MethodTypes, path: string, query: string, body: any = {}, session: any = {}, result: any = {}) {
    let params;
    const target = _.find(Tester.endpoints[method], endpoint => {
      const re = compileURL({url:endpoint.name});
      const res = matchURL(re, path);
      if (res) params = res;
      return res;
    });

    if (!target) throw new Error('invalid uri');

    const input = {query, body, session, result, params};
    let results: {query?: any, body?: any, session?: any, result?: any, params?: any} = {};
    for (const name of ['query', 'body', 'session', 'result', 'params']) {
      const schema: {sanitization: any, validation: any} = target.options.schema[name];
      if (!schema) return;
      const sanitized = sanitize(schema.sanitization, input[name]);
      const r = validate(schema.validation, sanitized);
      if (!r.valid) throw new Error('validation failed');
      results[name] = sanitized;
    }
    return results;
  }
}