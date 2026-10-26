// Sport definitions with labels and icons (lucide icon names)

export interface SportConfig {
  value: string;
  label: string;
  icon: string; // lucide icon name
  defaultTeamsPerGroup: number;
  defaultQualifyPerGroup: number;
}

export const SPORTS: SportConfig[] = [
  {
    value: "volleyball",
    label: "Voli",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
  {
    value: "football",
    label: "Sepak Bola",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
  {
    value: "futsal",
    label: "Futsal",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
  {
    value: "basketball",
    label: "Basket",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
  {
    value: "badminton",
    label: "Badminton",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
  {
    value: "table_tennis",
    label: "Tenis Meja",
    icon: "circle",
    defaultTeamsPerGroup: 4,
    defaultQualifyPerGroup: 2,
  },
];

export function getSportLabel(value: string): string {
  return SPORTS.find((s) => s.value === value)?.label ?? value;
}
