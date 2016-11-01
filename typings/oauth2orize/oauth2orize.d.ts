// Type definitions for amqp-rpc v1.0.1
// Project: https://github.com/jaredhanson/oauth2orize/
// Definitions by: Wonshik Kim <https://github.com/wokim/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module "oauth2orize" {
  import http = require('http');

  export function createServer(): OAuth2Server;

  export interface AuthorizeOptions {
    idLength?: number;
    sessionKey?: string;
  }

  export interface ErrorHandlerOptions {
    mode?: string;
  }

  export class OAuth2Server {
    exchange(fn: ExchangeFunction): OAuth2Server;
    exchange(type: string, fn: ExchangeFunction): OAuth2Server;
    // Parses requests to obtain authorization
    //authorize(options: AuthorizeOptions, validate: (clientId: string, redirectURI: string, validated: (err: Error, client: any, redirectURI: string) => void) => void): Function;
    //authorize(validate: (clientId: string, redirectURI: string, validated: (err: Error, client: any, redirectURI: string) => void) => void): Function;
    //authorization(options: AuthorizeOptions, validate: (clientId: string, redirectURI: string, validated: (err: Error, client: any, redirectURI: string) => void) => void): Function;
    //authorization(validate: (clientId: string, redirectURI: string, validated: (err: Error, client: any, redirectURI: string) => void) => void): Function;
    token(options?): (req, res, next) => void;
    errorHandler(options): (err: Error, req, res, next) => void;
    serializeClient();
    deserializeClient();
  }

  interface ExchangeFunction extends Function {
    (req: http.ServerRequest, res: http.ServerResponse, next: Function): void;
  }

  export module exchange {
    interface Options {
      // The 'user' property of `req` holds the authenticated user.  In the case
      // of the token endpoint, the property will contain the OAuth 2.0 client.
      userProperty?: string;

      // For maximum flexibility, multiple scope spearators can optionally be
      // allowed.  This allows the server to accept clients that separate scope
      // with either space or comma (' ', ',').  This violates the specification,
      // but achieves compatibility with existing client libraries that are already
      // deployed.
      scopeSeparator?: string;
    }

    interface IssuedFunction extends Function {
      (err: Error, accessToken: string, refreshToken?: string, params?: any): void;
    }

    function authorizationCode(options: Options, issue: (client: any, code: string, redirectURI: string, issued: IssuedFunction) => void): ExchangeFunction;
    function authorizationCode(issue: (client: any, code: string, redirectURI: string, issued: IssuedFunction) => void): ExchangeFunction;
    function code(options: Options, issue: (client: any, code: string, redirectURI: string, issued: IssuedFunction) => void): ExchangeFunction;
    function code(issue: (client: any, code: string, redirectURI: string, issued: IssuedFunction) => void): ExchangeFunction;

    function clientCredentials(options: Options, issue: (client: any, scope: string[], issued: IssuedFunction) => void);
    function clientCredentials(options: Options, issue: (client: any, issued: IssuedFunction) => void);
    function clientCredentials(issue: (client: any, scope: string[], issued: IssuedFunction) => void);
    function clientCredentials(issue: (client: any, issued: IssuedFunction) => void);

    function password(options: Options, issue: (client: any, username: string, password: string, scope: string[], issued: IssuedFunction) => void): ExchangeFunction;
    function password(options: Options, issue: (client: any, username: string, password: string, issued: IssuedFunction) => void): ExchangeFunction;
    function password(issue: (client: any, username: string, password: string, scope: string[], issued: IssuedFunction) => void): ExchangeFunction;
    function password(issue: (client: any, username: string, password: string, issued: IssuedFunction) => void): ExchangeFunction;

    function refreshToken(options: Options, issue: (client: any, refreshToken: string, scope: string[], issued: IssuedFunction) => void);
    function refreshToken(options: Options, issue: (client: any, refreshToken: string, issued: IssuedFunction) => void);
    function refreshToken(issue: (client: any, refreshToken: string, scope: string[], issued: IssuedFunction) => void);
    function refreshToken(issue: (client: any, refreshToken: string, issued: IssuedFunction) => void);
  }
}
