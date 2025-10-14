export const windowTemplates = {
  single_sash: "С одной створкой",
  double_sash: "С двумя створками",
  triple_sash: "С тремя створками",
  blind_sash: "С глухой створкой",
  transom: "С фрамугой",
  balcony_door: "Балконная дверь",
} as const;

export type WindowTemplateKey = keyof typeof windowTemplates;
export type WindowTemplateValue = (typeof windowTemplates)[WindowTemplateKey];
