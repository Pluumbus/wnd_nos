import React, { forwardRef } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

export type DismissKeyboardScrollViewProps = ScrollViewProps & {
  /** Стили внутренней области «тап вне полей» (отступы и т.д.) */
  tapToDismissContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Вертикальный ScrollView: скрытие клавиатуры по тапу вне инпутов и при прокрутке.
 * Для horizontal={true} только on-drag / без обёртки Pressable (иначе ломается раскладка).
 */
export const DismissKeyboardScrollView = forwardRef<
  ScrollView,
  DismissKeyboardScrollViewProps
>(function DismissKeyboardScrollView(
  { children, contentContainerStyle, tapToDismissContainerStyle, horizontal, ...rest },
  ref
) {
  const keyboardDefaults = {
    keyboardShouldPersistTaps: "handled" as const,
    keyboardDismissMode: "on-drag" as const,
  };

  if (horizontal) {
    return (
      <ScrollView
        ref={ref}
        horizontal
        {...keyboardDefaults}
        {...rest}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={ref}
      {...keyboardDefaults}
      {...rest}
      contentContainerStyle={[styles.grow, contentContainerStyle]}
    >
      <Pressable
        style={[styles.dismissArea, tapToDismissContainerStyle]}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        {children}
      </Pressable>
    </ScrollView>
  );
});

/** Полупрозрачный фон модалки: тап закрывает клавиатуру. Положите первым ребёнком в KeyboardAvoidingView. */
export function KeyboardDismissBackdrop(): React.ReactElement {
  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={Keyboard.dismiss}
      accessible={false}
    />
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
  dismissArea: { flexGrow: 1 },
});
