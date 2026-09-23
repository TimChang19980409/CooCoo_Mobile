global.IS_REACT_ACT_ENVIRONMENT = true;

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
