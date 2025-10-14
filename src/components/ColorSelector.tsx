import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ColorSelectorProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

const colorOptions = [
  { value: "white", label: "Белый", color: "#ffffff" },
  { value: "gray", label: "Серый", color: "#808080" },
];

const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  onColorSelect,
  disabled = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Цвет окна:
      </Text>
      <View style={styles.colorOptions}>
        {colorOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.colorOption,
              {
                borderColor:
                  selectedColor === option.value
                    ? theme.colors.primary
                    : theme.colors.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => !disabled && onColorSelect(option.value)}
            disabled={disabled}
          >
            <View
              style={[
                styles.colorPreview,
                {
                  backgroundColor: option.color,
                  borderColor: theme.colors.border,
                },
              ]}
            />
            <Text
              style={[
                styles.colorLabel,
                {
                  color:
                    selectedColor === option.value
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  colorOptions: {
    flexDirection: "row",
    gap: 12,
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 100,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ColorSelector;
