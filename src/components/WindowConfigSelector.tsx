import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface WindowConfigSelectorProps {
  selectedConfig: number;
  onConfigSelect: (config: number) => void;
  disabled?: boolean;
}

// Конфигурации окон (без названий, только ID)
const windowConfigurations = [
  // Row 1
  { id: 1, name: "Стандартное" },
  { id: 2, name: "Два окна" },
  { id: 3, name: "Три окна" },

  // Row 2
  { id: 4, name: "Четыре окна" },
  { id: 5, name: "Два горизонтальных" },
  { id: 6, name: "Три горизонтальных" },

  // Row 3
  { id: 7, name: "L-образное" },
  { id: 8, name: "T-образное" },
  { id: 9, name: "Обратное L" },

  // Row 4
  { id: 10, name: "L с разделением" },
  { id: 11, name: "T с разделением" },
  { id: 12, name: "Обратное L с разделением" },
];

const WindowConfigSelector: React.FC<WindowConfigSelectorProps> = ({
  selectedConfig,
  onConfigSelect,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedConfigData =
    windowConfigurations.find((config) => config.id === selectedConfig) ||
    windowConfigurations[0];

  const handleConfigSelect = (config: number) => {
    onConfigSelect(config);
    setModalVisible(false);
  };

  // Улучшенная визуализация конфигураций согласно новым изображениям
  const renderConfigPreview = (configId: number) => {
    const size = 60;
    const strokeWidth = 2; // Уменьшенная толщина рамы
    const strokeColor = selectedConfig === configId ? "#2196F3" : "#666";
    const glassColor = "white"; // Стекло всегда белое
    let elementCounter = 0; // Counter for unique keys

    const createRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      isFrame: boolean = false
    ) => (
      <View
        key={`rect-${configId}-${elementCounter++}-${x}-${y}`}
        style={[
          styles.previewRect,
          {
            position: "absolute",
            left: x,
            top: y,
            width,
            height,
            borderColor: isFrame ? strokeColor : strokeColor,
            borderWidth: isFrame ? strokeWidth * 2 : strokeWidth,
            backgroundColor: isFrame ? strokeColor : glassColor,
          },
        ]}
      />
    );

    const createLine = (x1: number, y1: number, x2: number, y2: number) => (
      <View
        key={`line-${configId}-${elementCounter++}-${x1}-${y1}`}
        style={[
          styles.previewLine,
          {
            position: "absolute",
            left: x1,
            top: y1,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
            backgroundColor: strokeColor,
          },
        ]}
      />
    );

    switch (configId) {
      case 1: // Стандартное окно - одно большое
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, size - 12, size - 12)}
          </View>
        );

      case 2: // Два вертикальных окна
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 2 - 1, size - 12)}
            {createRect(size / 2 + 1, 6, (size - 12) / 2 - 1, size - 12)}
            {createLine(size / 2, 6, size / 2, size - 6)}
          </View>
        );

      case 3: // Три вертикальных окна
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 5, size - 6, true)}
            {createRect(6, 6, (size - 12) / 3 - 1, size - 12)}
            {createRect(
              6 + (size - 12) / 3 + 1,
              6,
              (size - 12) / 3 - 1,
              size - 12
            )}
            {createRect(
              6 + (2 * (size - 12)) / 3 + 2,
              6,
              (size - 12) / 3 - 1,
              size - 12
            )}
            {createLine(6 + (size - 12) / 3, 6, 6 + (size - 12) / 3, size - 6)}
            {createLine(
              6 + (2 * (size - 12)) / 3,
              6,
              6 + (2 * (size - 12)) / 3,
              size - 6
            )}
          </View>
        );

      case 4: // Четыре вертикальных окна
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 4, size - 6, true)}
            {createRect(6, 6, (size - 12) / 4 - 1, size - 12)}
            {createRect(
              6 + (size - 12) / 4 + 1,
              6,
              (size - 12) / 4 - 1,
              size - 12
            )}
            {createRect(
              6 + (2 * (size - 12)) / 4 + 2,
              6,
              (size - 12) / 4 - 1,
              size - 12
            )}
            {createRect(
              6 + (3 * (size - 12)) / 4 + 3,
              6,
              (size - 12) / 4 - 1,
              size - 12
            )}
            {createLine(6 + (size - 12) / 4, 6, 6 + (size - 12) / 4, size - 6)}
            {createLine(
              6 + (2 * (size - 12)) / 4,
              6,
              6 + (2 * (size - 12)) / 4,
              size - 6
            )}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6,
              6 + (3 * (size - 12)) / 4,
              size - 6
            )}
          </View>
        );

      case 5: // Два горизонтальных окна
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, size - 12, (size - 12) / 2 - 1)}
            {createRect(6, size / 2 + 1, size - 12, (size - 12) / 2 - 1)}
            {createLine(6, size / 2, size - 6, size / 2)}
          </View>
        );

      case 6: // Три горизонтальных окна
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, size - 12, (size - 12) / 3 - 1)}
            {createRect(
              6,
              6 + (size - 12) / 3 + 1,
              size - 12,
              (size - 12) / 3 - 1
            )}
            {createRect(
              6,
              6 + (2 * (size - 12)) / 3 + 2,
              size - 12,
              (size - 12) / 3 - 1
            )}
            {createLine(6, 6 + (size - 12) / 3, size - 6, 6 + (size - 12) / 3)}
            {createLine(
              6,
              6 + (2 * (size - 12)) / 3,
              size - 6,
              6 + (2 * (size - 12)) / 3
            )}
          </View>
        );

      case 7: // L-образное окно (инвертированная L)
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 2 - 1, (size - 12) / 2 - 1)}
            {createRect(size / 2 + 1, 6, (size - 12) / 2 - 1, size - 12)}
            {createLine(size / 2, 6, size / 2, size - 6)}
          </View>
        );

      case 8: // T-образное окно
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 4 - 1, (size - 12) / 2 - 1)}
            {createRect(
              6 + (size - 12) / 4 + 1,
              6,
              (size - 12) / 2 - 2,
              size - 12
            )}
            {createRect(
              6 + (3 * (size - 12)) / 4 + 2,
              6,
              (size - 12) / 4 - 1,
              (size - 12) / 2 - 1
            )}
            {createLine(6 + (size - 12) / 4, 6, 6 + (size - 12) / 4, size - 6)}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6,
              6 + (3 * (size - 12)) / 4,
              size - 6
            )}
            {createLine(6, 6 + (size - 12) / 2, size - 6, 6 + (size - 12) / 2)}
          </View>
        );

      case 9: // Обратное L-образное окно (L повернутая влево)
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 2 - 1, size - 12)}
            {createRect(
              size / 2 + 1,
              6,
              (size - 12) / 2 - 1,
              (size - 12) / 2 - 1
            )}
            {createLine(
              size / 2,
              6 + (size - 12) / 2,
              size - 6,
              6 + (size - 12) / 2
            )}
          </View>
        );

      case 10: // L-образное окно с разделенными маленькими секциями
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 2 - 1, (size - 12) / 2 - 1)}
            {createRect(size / 2 + 1, 6, (size - 12) / 2 - 1, size - 12)}
            {createLine(size / 2, 6, size / 2, size - 6)}
            {createLine(6, size / 2, size / 2, size / 2)}
            {createLine(6 + (size - 12) / 4, 6, 6 + (size - 12) / 4, size / 2)}
            {createLine(
              6,
              6 + (size - 12) / 4,
              6 + (size - 12) / 2,
              6 + (size - 12) / 4
            )}
            {createLine(4 + (size - 12) / 4, 6, 6 + (size - 12) / 4, size / 2)}
          </View>
        );

      case 11: // T-образное окно с разделенными маленькими секциями
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 4 - 1, (size - 12) / 2 - 1)}
            {createRect(
              6 + (size - 12) / 4 + 1,
              6,
              (size - 12) / 2 - 2,
              size - 12
            )}
            {createRect(
              6 + (3 * (size - 12)) / 4 + 2,
              6,
              (size - 12) / 4 - 1,
              (size - 12) / 2 - 1
            )}
            {createLine(6 + (size - 12) / 4, 6, 6 + (size - 12) / 4, size - 6)}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6,
              6 + (3 * (size - 12)) / 4,
              size - 6
            )}
            {createLine(6, 6 + (size - 12) / 2, size - 6, 6 + (size - 12) / 2)}
            {createLine(
              6 + (size - 12) / 8,
              6,
              6 + (size - 12) / 8,
              6 + (size - 12) / 2
            )}
            {createLine(
              6 + (7 * (size - 12)) / 8,
              6,
              6 + (7 * (size - 12)) / 8,
              6 + (size - 12) / 2
            )}
            {createLine(
              6,
              6 + (size - 12) / 4,
              6 + (size - 12) / 4,
              6 + (size - 12) / 4
            )}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6 + (size - 12) / 4,
              6 + (size - 12),
              6 + (size - 12) / 4
            )}
            {createLine(
              7 + (7 * (size - 12)) / 8,
              6,
              8 + (7 * (size - 12)) / 8,
              6 + (size - 12) / 2
            )}
            {createLine(
              5 + (size - 12) / 8,
              6,
              6 + (size - 12) / 8,
              5 + (size - 12) / 2
            )}
          </View>
        );

      case 12: // Обратное L-образное окно с разделенными маленькими секциями
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, (size - 12) / 2 - 1, size - 12)}
            {createRect(
              size / 2 + 1,
              6,
              (size - 12) / 2 - 1,
              (size - 12) / 2 - 1
            )}
            {createLine(size / 2, size / 2, size - 6, size / 2)}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6,
              6 + (3 * (size - 12)) / 4,
              size / 2
            )}
            {createLine(
              size / 2,
              6 + (size - 12) / 4,
              6 + (size - 12),
              6 + (size - 12) / 4
            )}
            {createLine(
              6 + (3 * (size - 12)) / 4,
              6,
              4 + (3 * (size - 12)) / 4,
              size / 2
            )}
          </View>
        );

      default:
        return (
          <View
            style={[styles.previewContainer, { width: size, height: size }]}
          >
            {createRect(3, 3, size - 6, size - 6, true)}
            {createRect(6, 6, size - 12, size - 12)}
          </View>
        );
    }
  };

  const renderConfigGrid = () => {
    // Группируем конфигурации по строкам согласно структуре
    const rows = [
      // Row 1: 3 элемента (1, 2, 3)
      windowConfigurations.filter((config) => [1, 2, 3].includes(config.id)),
      // Row 2: 3 элемента (4, 5, 6)
      windowConfigurations.filter((config) => [4, 5, 6].includes(config.id)),
      // Row 3: 3 элемента (7, 8, 9)
      windowConfigurations.filter((config) => [7, 8, 9].includes(config.id)),
      // Row 4: 3 элемента (10, 11, 12)
      windowConfigurations.filter((config) => [10, 11, 12].includes(config.id)),
    ];

    return (
      <View style={styles.configGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.configRow}>
            {row.map((config) => (
              <TouchableOpacity
                key={config.id}
                style={[
                  styles.configItem,
                  // Все строки теперь содержат по 3 элемента
                  styles.configItemThree,
                  {
                    backgroundColor:
                      selectedConfig === config.id
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor:
                      selectedConfig === config.id
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => handleConfigSelect(config.id)}
                disabled={disabled}
              >
                <View style={styles.configPreview}>
                  {renderConfigPreview(config.id)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
          disabled && styles.disabled,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          <View style={styles.selectorIcon}>
            {renderConfigPreview(selectedConfig)}
          </View>
          <View style={styles.selectorText}>
            <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
              Конфигурация окна
            </Text>
            <Text
              style={[
                styles.selectorSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {selectedConfigData.name}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.selectorArrow, { color: theme.colors.textSecondary }]}
        >
          ›
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Выберите конфигурацию окна
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.colors.text }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {renderConfigGrid()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 60,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorIcon: {
    marginRight: 12,
  },
  selectorText: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  selectorSubtitle: {
    fontSize: 14,
  },
  selectorArrow: {
    fontSize: 20,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  configGrid: {
    flexDirection: "column",
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  configItem: {
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  // Стили для элементов в строке
  configItemThree: {
    width: "30%", // Для строк с 3 элементами
  },
  configPreview: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    position: "relative",
  },
  previewRect: {
    borderWidth: 2,
    borderRadius: 2,
  },
  previewLine: {
    position: "absolute",
  },
});

export default WindowConfigSelector;
