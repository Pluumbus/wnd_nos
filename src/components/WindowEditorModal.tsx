import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Svg, { Rect, Line, G, Text as SvgText, Circle } from "react-native-svg";
import {
  DismissKeyboardScrollView,
  KeyboardDismissBackdrop,
} from "./DismissKeyboardScrollView";
import { useTheme } from "../context/ThemeContext";
import { WindowConfig, WindowSection } from "./WindowVisualizer";
import { openingSashesTypes } from "../utils/opening_sashes.dict";
import {
  computeSectionsForConfig,
  getImpostPositions,
  ComputedSection,
} from "../utils/windowConfigurations";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Используем ComputedSection из windowConfigurations
type DisplaySection = ComputedSection;

interface WindowEditorModalProps {
  visible: boolean;
  onClose: () => void;
  config: WindowConfig;
  onConfigChange: (config: WindowConfig) => void;
}

interface SashTypeModalProps {
  visible: boolean;
  sectionId: string;
  onClose: () => void;
  onApply: (side: string, type: string, widthMM: number, heightMM: number) => void;
  currentSide?: string;
  currentType?: string;
  currentWidthMM?: number;
  currentHeightMM?: number;
}

const SashTypeModal: React.FC<SashTypeModalProps> = ({
  visible,
  sectionId,
  onClose,
  onApply,
  currentSide = "single",
  currentType = "tilt_turn",
  currentWidthMM = 0,
  currentHeightMM = 0,
}) => {
  const { theme } = useTheme();
  
  // Локальное состояние для редактирования без множественных setState в родителе
  const [localSide, setLocalSide] = useState(currentSide);
  const [localType, setLocalType] = useState(currentType);
  const [localWidth, setLocalWidth] = useState(String(currentWidthMM));
  const [localHeight, setLocalHeight] = useState(String(currentHeightMM));

  // Синхронизация с пропсами при открытии модалки
  useEffect(() => {
    if (visible) {
      setLocalSide(currentSide);
      setLocalType(currentType);
      setLocalWidth(String(currentWidthMM));
      setLocalHeight(String(currentHeightMM));
    }
  }, [visible, currentSide, currentType, currentWidthMM, currentHeightMM]);

  const sides = [
    { key: "fixed", label: "Глухое" },
    { key: "left", label: "Влево" },
    { key: "right", label: "Вправо" },
    { key: "top", label: "Откидное" },
    { key: "single", label: "Одна створка" },
  ];

  const types = [
    { key: "fixed", label: "Глухое" },
    { key: "tilt_turn", label: "Поворотно-откидное" },
    { key: "turn", label: "Поворотное" },
    { key: "tilt", label: "Откидное" },
    { key: "balcony_door", label: "Балконная дверь" },
  ];

  const handleApply = () => {
    const width = parseInt(localWidth) || 0;
    const height = parseInt(localHeight) || 0;
    onApply(localSide, localType, width, height);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <KeyboardDismissBackdrop />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Настройки секции
          </Text>

          {/* Размеры секции */}
          <Text
            style={[
              styles.modalSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Размеры секции (мм):
          </Text>
          <View style={styles.sizeInputsRow}>
            <View style={styles.sizeInputContainer}>
              <Text style={[styles.sizeInputLabel, { color: theme.colors.textSecondary }]}>
                Ширина
              </Text>
              <TextInput
                style={[
                  styles.modalSizeInput,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={localWidth}
                onChangeText={setLocalWidth}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.sizeSeparator, { color: theme.colors.textSecondary }]}>×</Text>
            <View style={styles.sizeInputContainer}>
              <Text style={[styles.sizeInputLabel, { color: theme.colors.textSecondary }]}>
                Высота
              </Text>
              <TextInput
                style={[
                  styles.modalSizeInput,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={localHeight}
                onChangeText={setLocalHeight}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <Text
            style={[
              styles.modalSubtitle,
              { color: theme.colors.textSecondary, marginTop: 20 },
            ]}
          >
            Сторона открытия:
          </Text>
          <View style={styles.optionsContainer}>
            {sides.map((side) => (
              <TouchableOpacity
                key={side.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      localSide === side.key
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setLocalSide(side.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        localSide === side.key
                          ? "white"
                          : theme.colors.text,
                    },
                  ]}
                >
                  {side.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.modalSubtitle,
              { color: theme.colors.textSecondary, marginTop: 20 },
            ]}
          >
            Тип окна:
          </Text>
          <View style={styles.optionsContainer}>
            {types.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      localType === type.key
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setLocalType(type.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        localType === type.key
                          ? "white"
                          : theme.colors.text,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.modalCancelButtonText, { color: theme.colors.text }]}>
                Отмена
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleApply}
            >
              <Text style={styles.modalButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const WindowEditorModal: React.FC<WindowEditorModalProps> = ({
  visible,
  onClose,
  config,
  onConfigChange,
}) => {
  const { theme } = useTheme();
  const [displaySections, setDisplaySections] = useState<DisplaySection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sashTypeModalVisible, setSashTypeModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Рассчитываем размеры для отображения
  const padding = 100;
  const displayScale = Math.min(
    (SCREEN_WIDTH - padding) / (config.width + padding),
    (SCREEN_HEIGHT * 0.7 - padding) / (config.height + padding)
  );
  const scaledWidth = config.width * displayScale;
  const scaledHeight = config.height * displayScale;

  // Центрируем окно
  const offsetX = (SCREEN_WIDTH - scaledWidth) / 2;
  const offsetY = 100; // Отступ сверху

  const frameWidth = 23;
  const sashWidth = 9;

  // Позиции импостов для отрисовки
  const impostPositions = getImpostPositions(
    config.config || 1,
    scaledWidth,
    scaledHeight,
    frameWidth
  );

  useEffect(() => {
    if (visible) {
      // Используем общую утилиту для генерации секций
      const newSections = computeSectionsForConfig(
        config.config || 1,
        scaledWidth,
        scaledHeight,
        config.width,
        config.height,
        frameWidth,
        sashWidth,
        config.sections
      );
      setDisplaySections(newSections);
    }
  }, [visible, config, scaledWidth, scaledHeight]);

  // Функция для сохранения изменений секций в config
  const saveSecationsToConfig = useCallback((sections: DisplaySection[]) => {
    const windowSections: WindowSection[] = sections.map((s) => ({
      id: s.id,
      widthMM: s.widthMM,
      heightMM: s.heightMM,
      openingSide: s.openingSide,
      openingType: s.openingType,
      hasHandle: s.hasHandle,
    }));

    onConfigChange({
      ...config,
      sections: windowSections,
    });
  }, [config, onConfigChange]);

  const handleSectionPress = (sectionId: string) => {
    setEditingSection(sectionId);
    setSelectedSection(sectionId);
    setSashTypeModalVisible(true);
  };

  const handleSashTypeApply = useCallback((side: string, type: string, widthMM: number, heightMM: number) => {
    if (editingSection) {
      const updatedSections = displaySections.map((sec) =>
        sec.id === editingSection
          ? { 
              ...sec, 
              openingSide: side as DisplaySection["openingSide"], 
              openingType: type as DisplaySection["openingType"],
              hasHandle: type !== "fixed",
              widthMM,
              heightMM,
            }
          : sec
      );
      setDisplaySections(updatedSections);
      // Сохраняем изменения в config одним вызовом
      saveSecationsToConfig(updatedSections);
    }
    setSashTypeModalVisible(false);
    setEditingSection(null);
  }, [editingSection, displaySections, saveSecationsToConfig]);

  // Обработчик закрытия модалки с сохранением
  const handleClose = () => {
    saveSecationsToConfig(displaySections);
    onClose();
  };

  const renderOpeningArrow = (section: DisplaySection) => {
    if (!section.glassX || section.openingSide === "single" || section.openingSide === "fixed") return null;

    const centerX = offsetX + section.glassX + section.glassWidth! / 2;
    const centerY = offsetY + section.glassY! + section.glassHeight! / 2;
    const arrowLength = 40;
    const arrowHeadSize = 8;

    let arrowX1 = 0;
    let arrowY1 = 0;
    let arrowX2 = 0;
    let arrowY2 = 0;
    let headX1 = 0;
    let headY1 = 0;
    let headX2 = 0;
    let headY2 = 0;

    switch (section.openingSide) {
      case "left":
        arrowX1 = centerX + arrowLength / 2;
        arrowY1 = centerY;
        arrowX2 = centerX - arrowLength / 2;
        arrowY2 = centerY;
        headX1 = arrowX2 + arrowHeadSize;
        headY1 = arrowY2 - arrowHeadSize / 2;
        headX2 = arrowX2 + arrowHeadSize;
        headY2 = arrowY2 + arrowHeadSize / 2;
        break;
      case "right":
        arrowX1 = centerX - arrowLength / 2;
        arrowY1 = centerY;
        arrowX2 = centerX + arrowLength / 2;
        arrowY2 = centerY;
        headX1 = arrowX2 - arrowHeadSize;
        headY1 = arrowY2 - arrowHeadSize / 2;
        headX2 = arrowX2 - arrowHeadSize;
        headY2 = arrowY2 + arrowHeadSize / 2;
        break;
      case "top":
        arrowX1 = centerX;
        arrowY1 = centerY + arrowLength / 2;
        arrowX2 = centerX;
        arrowY2 = centerY - arrowLength / 2;
        headX1 = arrowX2 - arrowHeadSize / 2;
        headY1 = arrowY2 + arrowHeadSize;
        headX2 = arrowX2 + arrowHeadSize / 2;
        headY2 = arrowY2 + arrowHeadSize;
        break;
      case "bottom":
        arrowX1 = centerX;
        arrowY1 = centerY - arrowLength / 2;
        arrowX2 = centerX;
        arrowY2 = centerY + arrowLength / 2;
        headX1 = arrowX2 - arrowHeadSize / 2;
        headY1 = arrowY2 - arrowHeadSize;
        headX2 = arrowX2 + arrowHeadSize / 2;
        headY2 = arrowY2 - arrowHeadSize;
        break;
    }

    return (
      <G>
        {/* Стрелка */}
        <Line
          x1={arrowX1}
          y1={arrowY1}
          x2={arrowX2}
          y2={arrowY2}
          stroke="#FF5722"
          strokeWidth={3}
        />
        {/* Голова стрелки */}
        <Line
          x1={arrowX2}
          y1={arrowY2}
          x2={headX1}
          y2={headY1}
          stroke="#FF5722"
          strokeWidth={3}
        />
        <Line
          x1={arrowX2}
          y1={arrowY2}
          x2={headX2}
          y2={headY2}
          stroke="#FF5722"
          strokeWidth={3}
        />
      </G>
    );
  };

  const renderDimensionLines = (section: DisplaySection) => {
    const x = offsetX + section.x;
    const y = offsetY + section.y;

    return (
      <G key={`dimensions-${section.id}`}>
        {/* Горизонтальная линия с размером (ширина) */}
        <Line
          x1={x}
          y1={y - 30}
          x2={x + section.width}
          y2={y - 30}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <Line
          x1={x}
          y1={y - 35}
          x2={x}
          y2={y - 25}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <Line
          x1={x + section.width}
          y1={y - 35}
          x2={x + section.width}
          y2={y - 25}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <SvgText
          x={x + section.width / 2}
          y={y - 35}
          fill="#2196F3"
          fontSize="12"
          textAnchor="middle"
        >
          {section.widthMM}мм
        </SvgText>

        {/* Вертикальная линия с размером (высота) */}
        <Line
          x1={x - 30}
          y1={y}
          x2={x - 30}
          y2={y + section.height}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <Line
          x1={x - 35}
          y1={y}
          x2={x - 25}
          y2={y}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <Line
          x1={x - 35}
          y1={y + section.height}
          x2={x - 25}
          y2={y + section.height}
          stroke="#2196F3"
          strokeWidth={2}
        />
        <SvgText
          x={x - 40}
          y={y + section.height / 2}
          fill="#2196F3"
          fontSize="12"
          textAnchor="middle"
          transform={`rotate(-90 ${x - 40} ${y + section.height / 2})`}
        >
          {section.heightMM}мм
        </SvgText>
      </G>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
              ✕
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Редактор окна
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <DismissKeyboardScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* SVG визуализация с размерами */}
          <View style={styles.svgContainer}>
            <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.7}>
              {/* Рамка окна */}
              <Rect
                x={offsetX}
                y={offsetY}
                width={scaledWidth}
                height={scaledHeight}
                fill="#F5F5F5"
                stroke="#E0E0E0"
                strokeWidth={frameWidth}
              />

              {/* Секции окна */}
              {displaySections.map((section) => (
                <G key={section.id}>
                  {/* Створка */}
                  <Rect
                    x={offsetX + section.x}
                    y={offsetY + section.y}
                    width={section.width}
                    height={section.height}
                    fill="none"
                    stroke="#E0E0E0"
                    strokeWidth={sashWidth}
                  />

                  {/* Стекло (визуальная область) */}
                  {section.glassX !== undefined && (
                    <>
                      <Rect
                        x={offsetX + section.glassX}
                        y={offsetY + section.glassY}
                        width={section.glassWidth}
                        height={section.glassHeight}
                        fill={section.openingType === "fixed" ? "#E8E8E8" : "#E3F2FD"}
                        opacity={0.4}
                      />
                      {/* Индикатор для тапа */}
                      <Circle
                        cx={offsetX + section.glassX + section.glassWidth / 2}
                        cy={offsetY + section.glassY + section.glassHeight / 2}
                        r={20}
                        fill={section.openingType === "fixed" ? "#9E9E9E" : "#2196F3"}
                        opacity={0.5}
                      />
                      {/* Ручка (если есть) */}
                      {section.hasHandle && section.openingType !== "fixed" && (
                        <G>
                          <Rect
                            x={
                              section.openingSide === "left"
                                ? offsetX + section.glassX + 15
                                : offsetX + section.glassX + section.glassWidth - 23
                            }
                            y={offsetY + section.glassY + section.glassHeight / 2 - 8}
                            width={8}
                            height={16}
                            fill="#666"
                            rx={2}
                          />
                        </G>
                      )}
                      {/* Стрелка направления открытия */}
                      {renderOpeningArrow(section)}
                    </>
                  )}

                  {/* Линии размеров */}
                  {renderDimensionLines(section)}
                </G>
              ))}

              {/* Вертикальные импосты */}
              {impostPositions.vertical.map((x, index) => (
                <Line
                  key={`v-impost-${index}`}
                  x1={offsetX + x}
                  y1={offsetY + frameWidth / 2}
                  x2={offsetX + x}
                  y2={offsetY + scaledHeight - frameWidth / 2}
                  stroke="#C0C0C0"
                  strokeWidth={3}
                />
              ))}

              {/* Горизонтальные импосты */}
              {impostPositions.horizontal.map((y, index) => (
                <Line
                  key={`h-impost-${index}`}
                  x1={offsetX + frameWidth / 2}
                  y1={offsetY + y}
                  x2={offsetX + scaledWidth - frameWidth / 2}
                  y2={offsetY + y}
                  stroke="#C0C0C0"
                  strokeWidth={3}
                />
              ))}

              {/* Общие размеры окна */}
              <G>
                <Line
                  x1={offsetX}
                  y1={offsetY - 50}
                  x2={offsetX + scaledWidth}
                  y2={offsetY - 50}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
                <Line
                  x1={offsetX}
                  y1={offsetY - 55}
                  x2={offsetX}
                  y2={offsetY - 45}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
                <Line
                  x1={offsetX + scaledWidth}
                  y1={offsetY - 55}
                  x2={offsetX + scaledWidth}
                  y2={offsetY - 45}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />

                <Line
                  x1={offsetX - 50}
                  y1={offsetY}
                  x2={offsetX - 50}
                  y2={offsetY + scaledHeight}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
                <Line
                  x1={offsetX - 55}
                  y1={offsetY}
                  x2={offsetX - 45}
                  y2={offsetY}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
                <Line
                  x1={offsetX - 55}
                  y1={offsetY + scaledHeight}
                  x2={offsetX - 45}
                  y2={offsetY + scaledHeight}
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
              </G>
            </Svg>
            {/* Инпуты для общих размеров окна */}
            <View style={styles.windowSizeInputsContainer}>
              <View
                style={[
                  styles.windowSizeInputRow,
                  {
                    top: offsetY - 60,
                    left: offsetX + scaledWidth / 2 - 40,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.windowSizeInput,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: "#4CAF50",
                    },
                  ]}
                  value={config.width.toString()}
                  onChangeText={(text) => {
                    const newWidth = parseInt(text) || 0;
                    onConfigChange({ ...config, width: newWidth });
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text style={[styles.windowSizeUnit, { color: "#4CAF50" }]}>мм</Text>
              </View>
              <View
                style={[
                  styles.windowSizeInputRowVertical,
                  {
                    left: offsetX - 90,
                    top: offsetY + scaledHeight / 2 - 14,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.windowSizeInputVertical,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: "#4CAF50",
                    },
                  ]}
                  value={config.height.toString()}
                  onChangeText={(text) => {
                    const newHeight = parseInt(text) || 0;
                    onConfigChange({ ...config, height: newHeight });
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text style={[styles.windowSizeUnitVertical, { color: "#4CAF50" }]}>мм</Text>
              </View>
            </View>
            {/* Touchable области поверх стекла */}
            {displaySections.map((section) => {
              if (section.glassX === undefined) return null;
              const glassScreenX = offsetX + section.glassX;
              const glassScreenY = offsetY + section.glassY!;
              return (
                <TouchableWithoutFeedback
                  key={`touch-${section.id}`}
                  onPress={() => handleSectionPress(section.id)}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: glassScreenX,
                      top: glassScreenY,
                      width: section.glassWidth,
                      height: section.glassHeight,
                      backgroundColor: "transparent",
                    }}
                  />
                </TouchableWithoutFeedback>
              );
            })}
          </View>

          {/* Список секций для редактирования */}
          <View style={styles.sectionsList}>
            <Text style={[styles.sectionsTitle, { color: theme.colors.text }]}>
              Редактирование секций:
            </Text>

            {displaySections.map((section, index) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionItem,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={() => handleSectionPress(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionId, { color: theme.colors.text }]}>
                    Секция {index + 1}
                  </Text>
                  <Text style={[styles.sectionSize, { color: theme.colors.primary }]}>
                    {section.widthMM} × {section.heightMM} мм
                  </Text>
                </View>
                
                <View style={styles.sectionInfo}>
                  <Text style={[styles.sectionInfoText, { color: theme.colors.textSecondary }]}>
                    {section.openingSide === "fixed"
                      ? "Глухое"
                      : section.openingSide === "single"
                      ? "Одна створка"
                      : section.openingSide === "left"
                      ? "Влево"
                      : section.openingSide === "right"
                      ? "Вправо"
                      : section.openingSide === "top"
                      ? "Откидное"
                      : "Вниз"}
                    {" • "}
                    {section.openingType === "tilt_turn"
                      ? "Поворотно-откидное"
                      : section.openingType === "turn"
                      ? "Поворотное"
                      : section.openingType === "tilt"
                      ? "Откидное"
                      : section.openingType === "fixed"
                      ? "Глухое"
                      : section.openingType === "balcony_door"
                      ? "Балконная дверь"
                      : "Окно"}
                  </Text>
                </View>
                
                <Text style={[styles.sectionEditHint, { color: theme.colors.primary }]}>
                  Нажмите для редактирования →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </DismissKeyboardScrollView>

        <SashTypeModal
          visible={sashTypeModalVisible}
          sectionId={editingSection || ""}
          onClose={() => {
            setSashTypeModalVisible(false);
            setEditingSection(null);
          }}
          onApply={handleSashTypeApply}
          currentSide={displaySections.find((s) => s.id === editingSection)?.openingSide}
          currentType={displaySections.find((s) => s.id === editingSection)?.openingType}
          currentWidthMM={displaySections.find((s) => s.id === editingSection)?.widthMM}
          currentHeightMM={displaySections.find((s) => s.id === editingSection)?.heightMM}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  svgContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: "#FAFAFA",
    marginBottom: 20,
  },
  sectionsList: {
    marginTop: 20,
  },
  sectionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  sectionId: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionSize: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionInfo: {
    marginBottom: 8,
  },
  sectionInfoText: {
    fontSize: 13,
  },
  sectionEditHint: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    flex: 1,
  },
  sizeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    marginLeft: 10,
  },
  sectionButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  sectionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  optionText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sizeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  sizeInputContainer: {
    flex: 1,
    alignItems: "center",
  },
  sizeInputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  sizeSeparator: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  modalSizeInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
  },
  windowSizeInputsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  windowSizeInputRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  windowSizeInput: {
    width: 60,
    height: 28,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    fontSize: 12,
    textAlign: "center",
  },
  windowSizeUnit: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  windowSizeInputRowVertical: {
    position: "absolute",
    flexDirection: "column",
    alignItems: "center",
  },
  windowSizeInputVertical: {
    width: 60,
    height: 28,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    fontSize: 12,
    textAlign: "center",
  },
  windowSizeUnitVertical: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    transform: [{ rotate: "-90deg" }],
  },
});

export default WindowEditorModal;

