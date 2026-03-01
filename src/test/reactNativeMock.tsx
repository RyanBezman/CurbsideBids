import { createElement, forwardRef, useImperativeHandle } from "react";
import type { ReactNode } from "react";

type Props = Record<string, unknown> & {
  children?: ReactNode;
};

function createMockComponent(name: string) {
  return ({ children, ...props }: Props) =>
    createElement(name, props, children);
}

export const View = createMockComponent("View");
export const Text = createMockComponent("Text");
export const SafeAreaView = createMockComponent("SafeAreaView");
export const TouchableOpacity = createMockComponent("TouchableOpacity");
export const Pressable = createMockComponent("Pressable");
export const Modal = createMockComponent("Modal");
export const ActivityIndicator = createMockComponent("ActivityIndicator");
export const TextInput = createMockComponent("TextInput");
export const Image = createMockComponent("Image");

export const ScrollView = forwardRef(function MockScrollView(
  { children, ...props }: Props,
  ref,
) {
  useImperativeHandle(ref, () => ({
    scrollTo: () => {},
  }));

  return createElement("ScrollView", props, children);
});

export const Alert = {
  alert: () => {},
};

export const LayoutAnimation = {
  configureNext: () => {},
  Presets: {
    easeInEaseOut: "easeInEaseOut",
  },
};

export const Platform = {
  OS: "ios",
};

export const UIManager = {
  setLayoutAnimationEnabledExperimental: () => {},
};

export const Keyboard = {
  addListener: () => ({
    remove: () => {},
  }),
};

class MockAnimatedValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  interpolate() {
    return this.value;
  }
}

function animationFactory() {
  return {
    start: () => {},
    stop: () => {},
  };
}

export const Animated = {
  View: createMockComponent("AnimatedView"),
  Value: MockAnimatedValue,
  loop: () => animationFactory(),
  sequence: () => animationFactory(),
  timing: () => animationFactory(),
};
