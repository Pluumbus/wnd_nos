/**
 * Утилита для генерации секций окна на основе конфигурации
 * Используется в WindowVisualizer и WindowEditorModal для синхронизации
 */

export interface SectionDefinition {
  id: string;
  // Позиция и размеры в долях от общего размера (0-1)
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  // Тип открывания по умолчанию
  defaultOpeningSide: "left" | "right" | "top" | "bottom" | "fixed" | "single";
  defaultOpeningType: "tilt_turn" | "turn" | "tilt" | "fixed";
  hasHandle: boolean;
}

export interface ConfigurationDefinition {
  id: number;
  name: string;
  sections: SectionDefinition[];
  // Линии импостов
  verticalImposts: number[]; // Позиции вертикальных импостов (в долях от ширины)
  horizontalImposts: number[]; // Позиции горизонтальных импостов (в долях от высоты)
}

// Определения всех конфигураций окон
export const WINDOW_CONFIGURATIONS: ConfigurationDefinition[] = [
  {
    id: 1,
    name: "Одно окно",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 1,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [],
    horizontalImposts: [],
  },
  {
    id: 2,
    name: "Два вертикальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_1",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [],
  },
  {
    id: 3,
    name: "Три вертикальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 1 / 3,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 1 / 3,
        yRatio: 0,
        widthRatio: 1 / 3,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 2 / 3,
        yRatio: 0,
        widthRatio: 1 / 3,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [1 / 3, 2 / 3],
    horizontalImposts: [],
  },
  {
    id: 4,
    name: "Четыре вертикальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.25,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_3",
        xRatio: 0.75,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.25, 0.5, 0.75],
    horizontalImposts: [],
  },
  {
    id: 5,
    name: "Два горизонтальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 1,
        heightRatio: 0.5,
        defaultOpeningSide: "top",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.5,
        widthRatio: 1,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [],
    horizontalImposts: [0.5],
  },
  {
    id: 6,
    name: "Три горизонтальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 1,
        heightRatio: 1 / 3,
        defaultOpeningSide: "top",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 1 / 3,
        widthRatio: 1,
        heightRatio: 1 / 3,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0,
        yRatio: 2 / 3,
        widthRatio: 1,
        heightRatio: 1 / 3,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [],
    horizontalImposts: [1 / 3, 2 / 3],
  },
  {
    id: 7,
    name: "L-образное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [],
  },
  {
    id: 8,
    name: "T-образное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.25,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "single",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_2",
        xRatio: 0.75,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.25, 0.75],
    horizontalImposts: [],
  },
  {
    id: 9,
    name: "Обратное L",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [],
  },
  {
    id: 10,
    name: "L с разделением",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.5,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [0.5],
  },
  {
    id: 11,
    name: "T с разделением",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.34,
        heightRatio: 1,
        defaultOpeningSide: "single",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_2",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.33, 0.67],
    horizontalImposts: [],
  },
  {
    id: 12,
    name: "Обратное L с разделением",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [],
  },
  {
    id: 13,
    name: "Левое L + вертикальное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.5,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [0.5],
  },
  {
    id: 14,
    name: "Симметричное с 5 секциями",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.5,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.34,
        heightRatio: 1,
        defaultOpeningSide: "single",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_3",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_4",
        xRatio: 0.67,
        yRatio: 0.5,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
    ],
    verticalImposts: [0.33, 0.67],
    horizontalImposts: [0.5],
  },
  {
    id: 15,
    name: "Правое L + вертикальное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.5,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_2",
        xRatio: 0.5,
        yRatio: 0.5,
        widthRatio: 0.5,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
    ],
    verticalImposts: [0.5],
    horizontalImposts: [0.5],
  },
  {
    id: 16,
    name: "Вертикальное зеркальное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.67,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.67,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.34,
        heightRatio: 1,
        defaultOpeningSide: "single",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_3",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.67,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_4",
        xRatio: 0.67,
        yRatio: 0.67,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
    ],
    verticalImposts: [0.33, 0.67],
    horizontalImposts: [0.67],
  },
  {
    id: 17,
    name: "Левое двойное + два вертикальных",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.5,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.34,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_3",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.33, 0.67],
    horizontalImposts: [0.5],
  },
  {
    id: 18,
    name: "Два вертикальных + правое двойное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.34,
        heightRatio: 1,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_3",
        xRatio: 0.67,
        yRatio: 0.5,
        widthRatio: 0.33,
        heightRatio: 0.5,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
    ],
    verticalImposts: [0.33, 0.67],
    horizontalImposts: [0.5],
  },
  {
    id: 19,
    name: "Левое тройное + вертикальное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "top",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.33,
        widthRatio: 0.33,
        heightRatio: 0.34,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0,
        yRatio: 0.67,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "bottom",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
      {
        id: "section_3",
        xRatio: 0.33,
        yRatio: 0,
        widthRatio: 0.67,
        heightRatio: 1,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.33],
    horizontalImposts: [0.33, 0.67],
  },
  {
    id: 20,
    name: "Сложное 7 секций",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 0.33,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0,
        yRatio: 0.33,
        widthRatio: 0.25,
        heightRatio: 0.34,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_2",
        xRatio: 0,
        yRatio: 0.67,
        widthRatio: 0.25,
        heightRatio: 0.33,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_3",
        xRatio: 0.25,
        yRatio: 0,
        widthRatio: 0.5,
        heightRatio: 1,
        defaultOpeningSide: "single",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_4",
        xRatio: 0.75,
        yRatio: 0,
        widthRatio: 0.25,
        heightRatio: 0.33,
        defaultOpeningSide: "right",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_5",
        xRatio: 0.75,
        yRatio: 0.33,
        widthRatio: 0.25,
        heightRatio: 0.34,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_6",
        xRatio: 0.75,
        yRatio: 0.67,
        widthRatio: 0.25,
        heightRatio: 0.33,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
    ],
    verticalImposts: [0.25, 0.75],
    horizontalImposts: [0.33, 0.67],
  },
  {
    id: 21,
    name: "Вертикальное + правое тройное",
    sections: [
      {
        id: "section_0",
        xRatio: 0,
        yRatio: 0,
        widthRatio: 0.67,
        heightRatio: 1,
        defaultOpeningSide: "left",
        defaultOpeningType: "tilt_turn",
        hasHandle: true,
      },
      {
        id: "section_1",
        xRatio: 0.67,
        yRatio: 0,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "top",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
      {
        id: "section_2",
        xRatio: 0.67,
        yRatio: 0.33,
        widthRatio: 0.33,
        heightRatio: 0.34,
        defaultOpeningSide: "fixed",
        defaultOpeningType: "fixed",
        hasHandle: false,
      },
      {
        id: "section_3",
        xRatio: 0.67,
        yRatio: 0.67,
        widthRatio: 0.33,
        heightRatio: 0.33,
        defaultOpeningSide: "bottom",
        defaultOpeningType: "tilt",
        hasHandle: true,
      },
    ],
    verticalImposts: [0.67],
    horizontalImposts: [0.33, 0.67],
  },
];

/**
 * Получить конфигурацию по ID
 */
export function getConfigurationById(
  configId: number
): ConfigurationDefinition | null {
  return WINDOW_CONFIGURATIONS.find((c) => c.id === configId) || null;
}

/**
 * Интерфейс для вычисленной секции (с реальными координатами)
 */
export interface ComputedSection {
  id: string;
  // SVG координаты
  x: number;
  y: number;
  width: number;
  height: number;
  // Реальные размеры в мм
  widthMM: number;
  heightMM: number;
  // Координаты стекла
  glassX: number;
  glassY: number;
  glassWidth: number;
  glassHeight: number;
  // Тип открывания
  openingSide: "left" | "right" | "top" | "bottom" | "fixed" | "single";
  openingType: "tilt_turn" | "turn" | "tilt" | "fixed";
  hasHandle: boolean;
}

/**
 * Вычислить секции для конфигурации
 */
export function computeSectionsForConfig(
  configId: number,
  scaledWidth: number,
  scaledHeight: number,
  realWidthMM: number,
  realHeightMM: number,
  frameWidth: number,
  sashWidth: number,
  existingSections?: Array<{
    id: string;
    openingSide?: string;
    openingType?: string;
    hasHandle?: boolean;
    widthMM?: number;
    heightMM?: number;
  }>
): ComputedSection[] {
  const configDef = getConfigurationById(configId);
  if (!configDef) {
    // Fallback к конфигурации 1
    return computeSectionsForConfig(
      1,
      scaledWidth,
      scaledHeight,
      realWidthMM,
      realHeightMM,
      frameWidth,
      sashWidth,
      existingSections
    );
  }

  const innerWidth = scaledWidth - frameWidth;
  const innerHeight = scaledHeight - frameWidth;
  const strokeWidth = 3;

  return configDef.sections.map((sectionDef) => {
    // Находим сохранённые данные секции (если есть)
    const saved = existingSections?.find((s) => s.id === sectionDef.id);

    // Вычисляем координаты
    const x = frameWidth / 2 + sectionDef.xRatio * innerWidth;
    const y = frameWidth / 2 + sectionDef.yRatio * innerHeight;
    const width = sectionDef.widthRatio * innerWidth - strokeWidth / 2;
    const height = sectionDef.heightRatio * innerHeight - strokeWidth / 2;

    // Реальные размеры в мм
    const widthMM = saved?.widthMM || Math.round(sectionDef.widthRatio * realWidthMM);
    const heightMM = saved?.heightMM || Math.round(sectionDef.heightRatio * realHeightMM);

    // Координаты стекла
    const glassX = x + sashWidth / 2;
    const glassY = y + sashWidth / 2;
    const glassWidth = width - sashWidth;
    const glassHeight = height - sashWidth;

    return {
      id: sectionDef.id,
      x,
      y,
      width,
      height,
      widthMM,
      heightMM,
      glassX,
      glassY,
      glassWidth,
      glassHeight,
      openingSide: (saved?.openingSide as ComputedSection["openingSide"]) || sectionDef.defaultOpeningSide,
      openingType: (saved?.openingType as ComputedSection["openingType"]) || sectionDef.defaultOpeningType,
      hasHandle: saved?.hasHandle ?? sectionDef.hasHandle,
    };
  });
}

/**
 * Получить позиции импостов для конфигурации
 */
export function getImpostPositions(
  configId: number,
  scaledWidth: number,
  scaledHeight: number,
  frameWidth: number
): {
  vertical: number[];
  horizontal: number[];
} {
  const configDef = getConfigurationById(configId);
  if (!configDef) {
    return { vertical: [], horizontal: [] };
  }

  const innerWidth = scaledWidth - frameWidth;
  const innerHeight = scaledHeight - frameWidth;

  return {
    vertical: configDef.verticalImposts.map(
      (ratio) => frameWidth / 2 + ratio * innerWidth
    ),
    horizontal: configDef.horizontalImposts.map(
      (ratio) => frameWidth / 2 + ratio * innerHeight
    ),
  };
}

export default WINDOW_CONFIGURATIONS;
