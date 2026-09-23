global.IS_REACT_ACT_ENVIRONMENT = true;

const http = require('node:http');
const https = require('node:https');

const globals = globalThis;
const PureResponse = globals.__nodeResponse ?? globalThis.Response;

function fetchWithNodeHttp(input, init = {}) {
  const url = new URL(typeof input === 'string' ? input : input.url);
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method:
          init.method ?? (typeof input === 'string' ? 'GET' : input.method),
        headers: init.headers,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          resolve(
            new PureResponse(Buffer.concat(chunks), {
              status: response.statusCode,
              headers: response.headers,
            }),
          );
        });
      },
    );
    request.on('error', reject);
    if (init.body) {
      request.write(init.body);
    }
    request.end();
  });
}

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  writable: true,
  value: fetchWithNodeHttp,
});

const { server } = require('../src/shared/api/mocks/node');

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (callback, ...args) => callback(...args),
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  class Keyframe {
    duration() {
      return this;
    }

    withCallback() {
      return this;
    }
  }

  const FadeIn = {
    duration() {
      return this;
    },
  };

  function AnimatedView(props) {
    return React.createElement(View, props);
  }

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
    },
    Easing: {
      elastic: () => undefined,
    },
    Keyframe,
    FadeIn,
  };
});
