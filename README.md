# island-endpoint-tester

```ts
import * as island from 'island';
import * as _ from 'lodash';
 
// NOTE: *order important* Test must be installed before endpoint-controllers
import { Tester } from 'island-endpoint-tester';
Tester.install(island);
 
import { EndpointController } from '../controller/endpoint.controller';
import spec = island.spec;
import mongoose = island.mongoose;
 
describe(EndpointController.name, () => {
  beforeAll(spec(async() => {
    Tester.register(EndpointController);
  }));
 
  it('GET /v2/admin/accounts', spec(async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const offset = 1;
    const limit = 30;
    const result = [{
      id: id, 
      activate: true,
    }];
 
    const testResult = Tester.GET(`/v2/admin/accounts?id=${id}&offset=${offset}&limit=${limit}`, {result});
    expect(testResult.query.id).toEqual(id);
    expect(testResult.query.offset).toEqual(offset);
    expect(testResult.query.limit).toEqual(limit);
  }));
});
```

