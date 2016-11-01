// referred from:
// https://github.com/restify/node-restify/blob/d2eabefd3f853d894768ca1273e831aeae8d6c0d/lib/router.js

import * as url from 'url';

export function matchURL(re, path) {
    var i = 0;
    var result = re.exec(path/*req.path()*/);
    var params = {};

    if (!result) {
        return (false);
    }

    // This means the user original specified a regexp match, not a url
    // string like /:foo/:bar
    if (!re.restifyParams) {
        for (i = 1; i < result.length; i++) {
            params[(i - 1)] = result[i];
        }

        return (params);
    }

    // This was a static string, like /foo
    if (re.restifyParams.length === 0) {
        return (params);
    }

    // This was the "normal" case, of /foo/:id
    re.restifyParams.forEach(function (p) {
        if (++i < result.length) {
            params[p] = decodeURIComponent(result[i]);
        }
    });

    return (params);
}

export function compileURL(options) {
    if (options.url instanceof RegExp) {
        return (options.url);
    }

    var params = [];
    var pattern = '^';
    var re;
    var _url = url.parse(options.url).pathname;
    _url.split('/').forEach(function (frag) {
        if (frag.length <= 0) {
            return (false);
        }

        pattern += '\\/+';

        if (frag.charAt(0) === ':') {
            var label = frag;
            var index = frag.indexOf('(');
            var subexp;

            if (index === -1) {
                if (options.urlParamPattern) {
                    subexp = options.urlParamPattern;
                } else {
                    subexp = '[^/]*';
                }
            } else {
                label = frag.substring(0, index);
                subexp = frag.substring(index + 1, frag.length - 1);
            }
            pattern += '(' + subexp + ')';
            params.push(label.slice(1));
        } else {
            pattern += frag;
        }
        return (true);
    });

    if (options.strict
        && _url.slice(-1) === '/') {
        pattern += '\\/';
    }

    if (!options.strict) {
        pattern += '[\\/]*';
    }

    if (pattern === '^') {
        pattern += '\\/';
    }

    pattern += '$';

    re = new RegExp(pattern, options.flags);
    re.restifyParams = params;

    return (re);
}