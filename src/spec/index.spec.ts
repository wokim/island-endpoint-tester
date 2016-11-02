import { Tester, Endpoint } from '../index';
import * as island from 'island';

describe(Tester.name, () => {
  it('should override endpointController decorator', () => {
    Tester.install(island);

    const name = 'GET /v2/ping';
    const options: island.EndpointOptions = {level: 10};
    island.endpointController()({_endpointMethods: [{name, options}]});
    const endpoints: {[method: string]: Endpoint[]} = (Tester as any).endpoints;
    expect(endpoints['GET'].length).toEqual(1);
    expect(endpoints['GET'][0].method).toEqual('GET');
    expect(endpoints['GET'][0].name).toEqual('/v2/ping');
    expect(endpoints['GET'][0].options).toEqual(options);

    const name2 = 'GET /v2/ping/:id';
    island.endpointController()({_endpointMethods: [{name: name2, options}]});
    expect(endpoints['GET'].length).toEqual(2);

    Tester.uninstall();
    expect((Tester as any).endpoints).toEqual({});
    expect((Tester as any).origin).toEqual({});
    expect((Tester as any).installed).toEqual(false);
  });

  it('should check GET method', () => {
    Tester.install(island);
    const uri = '/v2/accounts?sp.$lte=100&money.$gt=5000';
    const method = 'GET';
    const name = `${method} ${uri}`;
    const options: island.EndpointOptions = {schema: {
      result: {
        sanitization: {
          type: 'object',
          properties: {
            level: {type: 'number'},
            hello: {type: 'string'}
          }
        },
        validation: {
          type: 'object',
          properties: {
            level: {type: 'number'},
            hello: {type: 'string'}
          }
        }
      }
    }};
    island.endpointController()({_endpointMethods: [{name, options}]});
    const sanitized = Tester.GET(uri, {result: {hello: 'world', level: '5'}}, true);
    expect(sanitized.result).toEqual({hello: 'world', level: 5});
  });
});