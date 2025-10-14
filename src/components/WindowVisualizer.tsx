import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, G, Defs, Pattern } from "react-native-svg";

export interface WindowConfig {
  width: number;
  height: number;
  glassThickness: number;
  openingSashType: string;
  shTemplate: string;
  profileType?: string;
  furnitureType?: string;
  price: number;
  config?: number;
  color?: string;
}

interface WindowVisualizerProps {
  config: WindowConfig;
  width: number;
  height: number;
  isCompact?: boolean; // Флаг для компактного режима (sticky)
}

const WindowVisualizer: React.FC<WindowVisualizerProps> = ({
  config,
  width,
  height,
  isCompact = false,
}) => {
  // Адаптируем размеры для компактного режима
  const frameWidth = isCompact ? 10 : 23; // Толщина рамы
  const sashWidth = isCompact ? 6 : 9; // Толщина створки
  const handleSize = isCompact ? 3 : 15; // Размер ручки

  // Рассчитываем размеры для отображения
  const padding = isCompact ? 50 : 100; // Меньше отступов для компактного режима
  const displayScale = Math.min(
    width / (config.width + padding),
    height / (config.height + padding)
  );
  const scaledWidth = config.width * displayScale;
  const scaledHeight = config.height * displayScale;

  // Центрируем окно
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  // Функция для определения конфигурации шаблона окна
  const getTemplateConfiguration = (
    template: string,
    windowColor: string = "white"
  ) => {
    // Серо-белые цвета как на скриншоте
    const colors = {
      white: {
        frameColor: "#F5F5F5",
        sashColor: "#E0E0E0",
        handleColor: "#B0B0B0",
        thresholdColor: "#D0D0D0",
      },
      gray: {
        frameColor: "#808080",
        sashColor: "#696969",
        handleColor: "#404040",
        thresholdColor: "#A0A0A0",
      },
    };

    const colorScheme =
      colors[windowColor as keyof typeof colors] || colors.white;

    switch (template) {
      case "single_sash":
        return {
          type: "single",
          sashCount: 1,
          hasTransom: false,
          isBalcony: false,
          sashHeight: 1.0,
          ...colorScheme,
        };
      case "double_sash":
        return {
          type: "double",
          sashCount: 2,
          hasTransom: false,
          isBalcony: false,
          sashHeight: 1.0,
          ...colorScheme,
        };
      case "triple_sash":
        return {
          type: "triple",
          sashCount: 3,
          hasTransom: false,
          isBalcony: false,
          sashHeight: 1.0,
          ...colorScheme,
        };
      case "blind_sash":
        return {
          type: "blind",
          sashCount: 1,
          hasTransom: false,
          isBalcony: false,
          sashHeight: 1.0,
          ...colorScheme,
        };
      case "transom":
        return {
          type: "transom",
          sashCount: 2,
          hasTransom: true,
          isBalcony: false,
          sashHeight: 0.7,
          ...colorScheme,
        };
      case "balcony_door":
        return {
          type: "balcony",
          sashCount: 1,
          hasTransom: false,
          isBalcony: true,
          sashHeight: 1.0,
          ...colorScheme,
        };
      default:
        return {
          type: "single",
          sashCount: 1,
          hasTransom: false,
          isBalcony: false,
          sashHeight: 1.0,
          ...colorScheme,
        };
    }
  };

  const templateConfig = getTemplateConfiguration(
    config.shTemplate,
    config.color
  );

  // Функция для рисования ручки
  const renderHandle = (x: number, y: number, type: string) => {
    if (type === "fixed") return null;

    return (
      <>
        <Rect
          x={x - handleSize / 2}
          y={y - 3}
          width={handleSize}
          height={6}
          fill={templateConfig.handleColor}
          rx={2}
        />
        {type === "tilt-turn" && (
          <Rect
            x={x - 2}
            y={y - handleSize / 2}
            width={4}
            height={handleSize}
            fill={templateConfig.handleColor}
            rx={1}
          />
        )}
      </>
    );
  };

  // Функция для рисования стекла с учетом толщины
  const renderGlass = (
    x: number,
    y: number,
    w: number,
    h: number,
    thickness: number
  ) => {
    const glassOpacity = Math.min(0.3 + thickness / 50, 0.8);
    const glassColor = thickness > 20 ? "#E6F3FF" : "#B0E0E6"; // Более толстое стекло - светлее
    const strokeWidth = isCompact
      ? Math.max(0.5, thickness / 20) // Тоньше обводка для компактного режима
      : Math.max(1, thickness / 10); // Толщина обводки зависит от толщины стекла

    return (
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={`rgba(173, 216, 230, ${glassOpacity})`}
        stroke={glassColor}
        strokeWidth={strokeWidth}
      />
    );
  };

  // Функция для рендеринга окна в зависимости от конфигурации
  const renderWindowByConfig = () => {
    // Если конфигурация выбрана (больше 0), используем новую логику
    if (config.config && config.config > 0) {
      return renderWindowByConfiguration();
    }

    // Иначе используем старую логику шаблонов
    return renderWindowByTemplate();
  };

  // Функция для рендеринга окна в зависимости от шаблона (старая логика)
  const renderWindowByTemplate = () => {
    const effectiveHeight = scaledHeight * templateConfig.sashHeight;
    const transomHeight = templateConfig.hasTransom ? scaledHeight * 0.3 : 0;
    const mainSashHeight = effectiveHeight - transomHeight;

    // Адаптивная толщина линий для компактного режима
    const adaptiveStrokeWidth = isCompact ? 1.5 : 3;
    const adaptiveFrameStroke = isCompact
      ? 2
      : templateConfig.isBalcony
      ? 4
      : 3;
    const adaptiveSashStroke = isCompact
      ? Math.max(1, sashWidth / 2)
      : sashWidth;

    return (
      <>
        {/* Основная рама с цветом в зависимости от шаблона */}
        <Rect
          x={offsetX}
          y={offsetY}
          width={scaledWidth}
          height={scaledHeight}
          fill={templateConfig.frameColor}
          // stroke={templateConfig.sashColor}
          strokeWidth={adaptiveFrameStroke}
        />

        {/* Фрамуга (если есть) */}
        {templateConfig.hasTransom && (
          <>
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={scaledWidth - frameWidth}
              height={transomHeight - frameWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              scaledWidth - frameWidth - sashWidth,
              transomHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
          </>
        )}

        {/* Основные створки */}
        {templateConfig.type === "single" && (
          <>
            {/* Одна створка */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2 + transomHeight}
              width={scaledWidth - frameWidth}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2 + transomHeight,
              scaledWidth - frameWidth - sashWidth,
              mainSashHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {renderHandle(
              offsetX + scaledWidth - frameWidth - 30,
              offsetY + transomHeight + mainSashHeight / 2,
              getSashTypeForPosition("single")
            )}
          </>
        )}

        {templateConfig.type === "double" && (
          <>
            {/* Левая створка */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2 + transomHeight}
              width={(scaledWidth - frameWidth) / 2}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая створка */}
            <Rect
              x={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y={offsetY + frameWidth / 2 + transomHeight}
              width={(scaledWidth - frameWidth) / 2}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />

            {/* Стекло левой створки */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2 + transomHeight,
              (scaledWidth - frameWidth) / 2 - sashWidth,
              mainSashHeight - frameWidth - sashWidth,
              config.glassThickness
            )}

            {/* Стекло правой створки */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2 + transomHeight,
              (scaledWidth - frameWidth) / 2 - sashWidth,
              mainSashHeight - frameWidth - sashWidth,
              config.glassThickness
            )}

            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 4,
              offsetY + transomHeight + mainSashHeight / 2,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + transomHeight + mainSashHeight / 2,
              getSashTypeForPosition("right")
            )}

            {/* Средняя перекладина */}
            <Line
              x1={offsetX + scaledWidth / 2}
              y1={offsetY + frameWidth / 2 + transomHeight}
              x2={offsetX + scaledWidth / 2}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
          </>
        )}

        {templateConfig.type === "triple" && (
          <>
            {/* Левая створка */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2 + transomHeight}
              width={(scaledWidth - frameWidth) / 3}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Средняя створка */}
            <Rect
              x={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 3}
              y={offsetY + frameWidth / 2 + transomHeight}
              width={(scaledWidth - frameWidth) / 3}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая створка */}
            <Rect
              x={
                offsetX + frameWidth / 2 + (2 * (scaledWidth - frameWidth)) / 3
              }
              y={offsetY + frameWidth / 2 + transomHeight}
              width={(scaledWidth - frameWidth) / 3}
              height={mainSashHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />

            {/* Стекло для всех трех створок */}
            {[0, 1, 2].map((e, index) => (
              <React.Fragment key={index}>
                {renderGlass(
                  offsetX +
                    frameWidth / 2 +
                    (index * (scaledWidth - frameWidth)) / 3 +
                    sashWidth / 2,
                  offsetY + frameWidth / 2 + sashWidth / 2 + transomHeight,
                  (scaledWidth - frameWidth) / 3 - sashWidth,
                  mainSashHeight - frameWidth - sashWidth,
                  config.glassThickness
                )}
                {renderHandle(
                  offsetX +
                    frameWidth / 2 +
                    ((index + 0.5) * (scaledWidth - frameWidth)) / 3,
                  offsetY + transomHeight + mainSashHeight / 2,
                  index === 0
                    ? getSashTypeForPosition("left")
                    : index === 1
                    ? "fixed"
                    : getSashTypeForPosition("right")
                )}
              </React.Fragment>
            ))}

            {/* Вертикальные перекладины */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 3}
              y1={offsetY + frameWidth / 2 + transomHeight}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 3}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            <Line
              x1={
                offsetX + frameWidth / 2 + (2 * (scaledWidth - frameWidth)) / 3
              }
              y1={offsetY + frameWidth / 2 + transomHeight}
              x2={
                offsetX + frameWidth / 2 + (2 * (scaledWidth - frameWidth)) / 3
              }
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
          </>
        )}

        {/* Горизонтальная перекладина для фрамуги */}
        {templateConfig.hasTransom && (
          <Line
            x1={offsetX + frameWidth / 2}
            y1={offsetY + frameWidth / 2 + transomHeight}
            x2={offsetX + scaledWidth - frameWidth / 2}
            y2={offsetY + frameWidth / 2 + transomHeight}
            stroke={templateConfig.sashColor}
            strokeWidth={adaptiveStrokeWidth}
          />
        )}

        {/* Специальные элементы для балконной двери */}
        {templateConfig.isBalcony && (
          <>
            {/* Порог */}
            <Rect
              x={offsetX - 10}
              y={offsetY + scaledHeight - 5}
              width={scaledWidth + 20}
              height={10}
              fill={templateConfig.thresholdColor}
              stroke={templateConfig.sashColor}
              strokeWidth={isCompact ? 1 : 2}
            />
            {/* Дверная ручка */}
            <Rect
              x={offsetX + scaledWidth - 40}
              y={offsetY + scaledHeight / 2 - 10}
              width={8}
              height={20}
              fill={templateConfig.handleColor}
              stroke={templateConfig.sashColor}
              strokeWidth={isCompact ? 0.5 : 1}
            />
          </>
        )}
      </>
    );
  };

  // Функция для определения типа створки для конкретной позиции
  const getSashTypeForPosition = (
    position: "left" | "center" | "right" | "single"
  ) => {
    const sashType = Number(config.openingSashType) || 1; // По умолчанию "Обе створки поворотные"

    // Для одиночных створок
    if (position === "single") {
      switch (sashType) {
        case 7:
          return "swing";
        case 8:
          return "tilt-turn";
        case 9:
          return "tilt";
        case 10:
          return "fixed";
        default:
          return "fixed";
      }
    }

    // Для двух створок
    if (position === "left" || position === "right") {
      switch (sashType) {
        case 1:
          return "swing"; // Обе поворотные
        case 2:
          return "tilt-turn"; // Обе поворотно-откидные
        case 3:
          return position === "left" ? "swing" : "fixed"; // Левая поворотная, правая глухая
        case 4:
          return position === "right" ? "swing" : "fixed"; // Правая поворотная, левая глухая
        case 5:
          return position === "left" ? "tilt-turn" : "fixed"; // Левая поворотно-откидная, правая глухая
        case 6:
          return position === "right" ? "tilt-turn" : "fixed"; // Правая поворотно-откидная, левая глухая
        default:
          return "fixed";
      }
    }

    // Для центральной створки (в тройных окнах)
    if (position === "center") {
      return "fixed"; // Центральная обычно глухая
    }

    return "fixed";
  };

  // Функция для рендеринга окна по конфигурации
  const renderWindowByConfiguration = () => {
    const configId = config.config || 1;
    const adaptiveStrokeWidth = isCompact ? 1.5 : 3;
    const adaptiveFrameStroke = isCompact ? 2 : 3;
    const adaptiveSashStroke = isCompact
      ? Math.max(1, sashWidth / 2)
      : sashWidth;

    switch (configId) {
      case 1: // Одно большое горизонтальное окно
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={scaledWidth - frameWidth}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              scaledWidth - frameWidth - sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {renderHandle(
              offsetX + scaledWidth - frameWidth - 30,
              offsetY + scaledHeight / 2,
              getSashTypeForPosition("single")
            )}
          </>
        );

      case 2: // Два вертикальных окна
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левое окно */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правое окно */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левого окна */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Стекло правого окна */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Вертикальная перекладина */}
            <Line
              x1={offsetX + scaledWidth / 2}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + scaledWidth / 2}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 4,
              offsetY + scaledHeight / 2,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + scaledHeight / 2,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 3: // Три вертикальных окна
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Три окна */}
            {[0, 1, 2].map((e, index) => (
              <React.Fragment key={index}>
                <Rect
                  x={
                    offsetX +
                    frameWidth / 2 +
                    (index * (scaledWidth - frameWidth)) / 3
                  }
                  y={offsetY + frameWidth / 2}
                  width={
                    (scaledWidth - frameWidth) / 3 - adaptiveStrokeWidth / 2
                  }
                  height={scaledHeight - frameWidth}
                  fill="none"
                  stroke={templateConfig.sashColor}
                  strokeWidth={adaptiveSashStroke}
                />
                {renderGlass(
                  offsetX +
                    frameWidth / 2 +
                    (index * (scaledWidth - frameWidth)) / 3 +
                    sashWidth / 2,
                  offsetY + frameWidth / 2 + sashWidth / 2,
                  (scaledWidth - frameWidth) / 3 -
                    adaptiveStrokeWidth / 2 -
                    sashWidth,
                  scaledHeight - frameWidth - sashWidth,
                  config.glassThickness
                )}
                {renderHandle(
                  offsetX +
                    frameWidth / 2 +
                    ((index + 0.5) * (scaledWidth - frameWidth)) / 3,
                  offsetY + scaledHeight / 2,
                  index === 0
                    ? getSashTypeForPosition("left")
                    : index === 2
                    ? getSashTypeForPosition("right")
                    : "fixed"
                )}
                {/* Вертикальные перекладины */}
                {index < 2 && (
                  <Line
                    x1={
                      offsetX +
                      frameWidth / 2 +
                      ((index + 1) * (scaledWidth - frameWidth)) / 3
                    }
                    y1={offsetY + frameWidth / 2}
                    x2={
                      offsetX +
                      frameWidth / 2 +
                      ((index + 1) * (scaledWidth - frameWidth)) / 3
                    }
                    y2={offsetY + scaledHeight - frameWidth / 2}
                    stroke={templateConfig.sashColor}
                    strokeWidth={adaptiveStrokeWidth}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        );

      case 4: // Четыре вертикальных окна
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Четыре окна */}
            {[0, 1, 2, 3].map((e, index) => (
              <React.Fragment key={index}>
                <Rect
                  x={
                    offsetX +
                    frameWidth / 2 +
                    (index * (scaledWidth - frameWidth)) / 4
                  }
                  y={offsetY + frameWidth / 2}
                  width={
                    (scaledWidth - frameWidth) / 4 - adaptiveStrokeWidth / 2
                  }
                  height={scaledHeight - frameWidth}
                  fill="none"
                  stroke={templateConfig.sashColor}
                  strokeWidth={adaptiveSashStroke}
                />
                {renderGlass(
                  offsetX +
                    frameWidth / 2 +
                    (index * (scaledWidth - frameWidth)) / 4 +
                    sashWidth / 2,
                  offsetY + frameWidth / 2 + sashWidth / 2,
                  (scaledWidth - frameWidth) / 4 -
                    adaptiveStrokeWidth / 2 -
                    sashWidth,
                  scaledHeight - frameWidth - sashWidth,
                  config.glassThickness
                )}
                {renderHandle(
                  offsetX +
                    frameWidth / 2 +
                    ((index + 0.5) * (scaledWidth - frameWidth)) / 4,
                  offsetY + scaledHeight / 2,
                  index === 0
                    ? getSashTypeForPosition("left")
                    : index === 3
                    ? getSashTypeForPosition("right")
                    : "fixed"
                )}
                {/* Вертикальные перекладины */}
                {index < 3 && (
                  <Line
                    x1={
                      offsetX +
                      frameWidth / 2 +
                      ((index + 1) * (scaledWidth - frameWidth)) / 4
                    }
                    y1={offsetY + frameWidth / 2}
                    x2={
                      offsetX +
                      frameWidth / 2 +
                      ((index + 1) * (scaledWidth - frameWidth)) / 4
                    }
                    y2={offsetY + scaledHeight - frameWidth / 2}
                    stroke={templateConfig.sashColor}
                    strokeWidth={adaptiveStrokeWidth}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        );

      case 5: // Два горизонтальных окна
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Верхнее окно */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={scaledWidth - frameWidth}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Нижнее окно */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={
                offsetY +
                frameWidth / 2 +
                (scaledHeight - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              width={scaledWidth - frameWidth}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло верхнего окна */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              scaledWidth - frameWidth - sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Стекло нижнего окна */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY +
                frameWidth / 2 +
                (scaledHeight - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              scaledWidth - frameWidth - sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Горизонтальная перекладина */}
            <Line
              x1={offsetX + frameWidth / 2}
              y1={offsetY + scaledHeight / 2}
              x2={offsetX + scaledWidth - frameWidth / 2}
              y2={offsetY + scaledHeight / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + scaledWidth - frameWidth - 30,
              offsetY + (scaledHeight - frameWidth) / 4,
              getSashTypeForPosition("single")
            )}
            {renderHandle(
              offsetX + scaledWidth - frameWidth - 30,
              offsetY + frameWidth / 2 + (3 * (scaledHeight - frameWidth)) / 4,
              getSashTypeForPosition("single")
            )}
          </>
        );

      case 6: // Три горизонтальных окна
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Три горизонтальных окна */}
            {[0, 1, 2].map((e, index) => (
              <React.Fragment key={index}>
                <Rect
                  x={offsetX + frameWidth / 2}
                  y={
                    offsetY +
                    frameWidth / 2 +
                    (index * (scaledHeight - frameWidth)) / 3
                  }
                  width={scaledWidth - frameWidth}
                  height={
                    (scaledHeight - frameWidth) / 3 - adaptiveStrokeWidth / 2
                  }
                  fill="none"
                  stroke={templateConfig.sashColor}
                  strokeWidth={adaptiveSashStroke}
                />
                {renderGlass(
                  offsetX + frameWidth / 2 + sashWidth / 2,
                  offsetY +
                    frameWidth / 2 +
                    (index * (scaledHeight - frameWidth)) / 3 +
                    sashWidth / 2,
                  scaledWidth - frameWidth - sashWidth,
                  (scaledHeight - frameWidth) / 3 -
                    adaptiveStrokeWidth / 2 -
                    sashWidth,
                  config.glassThickness
                )}
                {renderHandle(
                  offsetX + scaledWidth - frameWidth - 30,
                  offsetY +
                    frameWidth / 2 +
                    ((index + 0.5) * (scaledHeight - frameWidth)) / 3,
                  index === 1 ? "fixed" : getSashTypeForPosition("single")
                )}
                {/* Горизонтальные перекладины */}
                {index < 2 && (
                  <Line
                    x1={offsetX + frameWidth / 2}
                    y1={
                      offsetY +
                      frameWidth / 2 +
                      ((index + 1) * (scaledHeight - frameWidth)) / 3
                    }
                    x2={offsetX + scaledWidth - frameWidth / 2}
                    y2={
                      offsetY +
                      frameWidth / 2 +
                      ((index + 1) * (scaledHeight - frameWidth)) / 3
                    }
                    stroke={templateConfig.sashColor}
                    strokeWidth={adaptiveStrokeWidth}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        );

      case 7: // L-образное окно (инвертированная L)
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая верхняя часть - квадратная */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая нижняя часть - прямоугольная, вытянутая вниз */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой верхней части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой нижней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Горизонтальная перекладина */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 4,
              offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 4,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 8: // T-образное окно
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая верхняя часть - вертикальное окно средней длины */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 4 - adaptiveStrokeWidth / 2}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Средняя часть - вертикальное окно в два раза больше */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 4 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая верхняя часть - отзеркаленная левая */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (3 * (scaledWidth - frameWidth)) / 4 +
                adaptiveStrokeWidth
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 4 - adaptiveStrokeWidth / 2}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 4 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Стекло средней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 4 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth - sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (3 * (scaledWidth - frameWidth)) / 4 +
                adaptiveStrokeWidth +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 4 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Вертикальные перекладины */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            <Line
              x1={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y1={offsetY + frameWidth / 2}
              x2={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Горизонтальная перекладина */}
            {/* <Line
              x1={offsetX + frameWidth / 2}
              y1={offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 2}
              x2={offsetX + scaledWidth - frameWidth / 2}
              y2={offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            /> */}
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 8,
              offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 4,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + scaledWidth / 2,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("single")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (7 * (scaledWidth - frameWidth)) / 8,
              offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 4,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 9: // Обратное L-образное окно (L повернутая влево)
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая часть - высокий прямоугольник на всю высоту */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая верхняя часть - квадратная */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой верхней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Горизонтальная перекладина */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y1={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              x2={offsetX + scaledWidth - frameWidth / 2}
              y2={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 4,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 4,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 10: // L-образное окно с разделенными маленькими секциями
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая верхняя часть - квадратная, разделенная пополам */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая нижняя часть - прямоугольная, вытянутая вниз */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой верхней части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой нижней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Вертикальная перекладина */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Горизонтальная перекладина в левой части */}
            <Line
              x1={offsetX + frameWidth / 2}
              y1={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y2={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Вертикальная перекладина в левой части (делит на 2 окна) */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y2={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 8,
              offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 4,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 11: // T-образное окно с разделенными маленькими секциями
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая верхняя часть - вертикальное окно средней длины, разделенное пополам */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 4 - adaptiveStrokeWidth / 2}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Средняя часть - вертикальное окно в два раза больше */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 4 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая верхняя часть - отзеркаленная левая, разделенная пополам */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (3 * (scaledWidth - frameWidth)) / 4 +
                adaptiveStrokeWidth
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 4 - adaptiveStrokeWidth / 2}
              height={(scaledHeight - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 4 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Стекло средней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 4 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth - sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (3 * (scaledWidth - frameWidth)) / 4 +
                adaptiveStrokeWidth +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 4 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledHeight - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Вертикальные перекладины */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 4}
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            <Line
              x1={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y1={offsetY + frameWidth / 2}
              x2={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y2={offsetY + scaledHeight - frameWidth / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Горизонтальная перекладина */}

            {/* Вертикальная перекладина в левой части (делит на 2 окна) */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 8}
              y1={offsetY + frameWidth / 2}
              x2={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 8}
              y2={offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Вертикальная перекладина в правой части (делит на 2 окна) */}
            <Line
              x1={
                offsetX + frameWidth / 2 + (7 * (scaledWidth - frameWidth)) / 8
              }
              y1={offsetY + frameWidth / 2}
              x2={
                offsetX + frameWidth / 2 + (7 * (scaledWidth - frameWidth)) / 8
              }
              y2={offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 8,
              offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 4,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + scaledWidth / 2,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("single")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (7 * (scaledWidth - frameWidth)) / 8,
              offsetY + frameWidth / 2 + (scaledHeight - frameWidth) / 4,
              getSashTypeForPosition("right")
            )}
          </>
        );

      case 12: // Обратное L-образное окно с разделенными маленькими секциями
        return (
          <>
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill={templateConfig.frameColor}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveFrameStroke}
            />
            {/* Левая часть - высокий прямоугольник на всю высоту */}
            <Rect
              x={offsetX + frameWidth / 2}
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={scaledHeight - frameWidth}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Правая верхняя часть - квадратная, разделенная пополам */}
            <Rect
              x={
                offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2
              }
              y={offsetY + frameWidth / 2}
              width={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              height={(scaledWidth - frameWidth) / 2 - adaptiveStrokeWidth / 2}
              fill="none"
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveSashStroke}
            />
            {/* Стекло левой части */}
            {renderGlass(
              offsetX + frameWidth / 2 + sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              scaledHeight - frameWidth - sashWidth,
              config.glassThickness
            )}
            {/* Стекло правой верхней части */}
            {renderGlass(
              offsetX +
                frameWidth / 2 +
                (scaledWidth - frameWidth) / 2 +
                adaptiveStrokeWidth / 2 +
                sashWidth / 2,
              offsetY + frameWidth / 2 + sashWidth / 2,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              (scaledWidth - frameWidth) / 2 -
                adaptiveStrokeWidth / 2 -
                sashWidth,
              config.glassThickness
            )}
            {/* Горизонтальная перекладина */}
            <Line
              x1={offsetX + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              y1={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              x2={offsetX + scaledWidth - frameWidth / 2}
              y2={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Вертикальная перекладина в правой части (делит на 2 окна) */}
            <Line
              x1={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y1={offsetY + frameWidth / 2}
              x2={
                offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4
              }
              y2={offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 2}
              stroke={templateConfig.sashColor}
              strokeWidth={adaptiveStrokeWidth}
            />
            {/* Ручки */}
            {renderHandle(
              offsetX + (scaledWidth - frameWidth) / 4,
              offsetY + frameWidth / 2 + scaledHeight / 2,
              getSashTypeForPosition("left")
            )}
            {renderHandle(
              offsetX + frameWidth / 2 + (3 * (scaledWidth - frameWidth)) / 4,
              offsetY + frameWidth / 2 + (scaledWidth - frameWidth) / 4,
              getSashTypeForPosition("right")
            )}
          </>
        );

      default:
        return renderWindowByTemplate();
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {renderWindowByConfig()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
});

export default WindowVisualizer;
