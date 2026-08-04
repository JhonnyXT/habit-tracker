import type { SFSymbol } from 'sf-symbols-typescript';

type IconEntry = {
  sf: SFSymbol;
  fallback: { set: 'ionicons' | 'material'; name: string };
};

export const icons = {
  today: { sf: 'flame.fill', fallback: { set: 'ionicons', name: 'flame' } },
  habits: { sf: 'square.grid.2x2.fill', fallback: { set: 'ionicons', name: 'grid' } },
  settings: { sf: 'gearshape.fill', fallback: { set: 'ionicons', name: 'settings' } },

  add: { sf: 'plus', fallback: { set: 'ionicons', name: 'add' } },
  back: { sf: 'chevron.left', fallback: { set: 'ionicons', name: 'chevron-back' } },
  chevron: { sf: 'chevron.right', fallback: { set: 'ionicons', name: 'chevron-forward' } },
  check: { sf: 'checkmark', fallback: { set: 'ionicons', name: 'checkmark' } },
  close: { sf: 'xmark', fallback: { set: 'ionicons', name: 'close' } },
  checkCircle: { sf: 'checkmark.circle.fill', fallback: { set: 'ionicons', name: 'checkmark-circle' } },
  edit: { sf: 'pencil', fallback: { set: 'ionicons', name: 'pencil' } },
  undo: { sf: 'arrow.uturn.backward', fallback: { set: 'ionicons', name: 'arrow-undo' } },
  search: { sf: 'magnifyingglass', fallback: { set: 'ionicons', name: 'search' } },
  calendar: { sf: 'calendar', fallback: { set: 'ionicons', name: 'calendar' } },
  moon: { sf: 'moon.fill', fallback: { set: 'ionicons', name: 'moon' } },

  streak: { sf: 'flame.fill', fallback: { set: 'ionicons', name: 'flame' } },
  trophy: { sf: 'trophy.fill', fallback: { set: 'ionicons', name: 'trophy' } },
  chart: { sf: 'chart.bar.fill', fallback: { set: 'ionicons', name: 'stats-chart' } },

  bell: { sf: 'bell.fill', fallback: { set: 'ionicons', name: 'notifications' } },
  export: { sf: 'square.and.arrow.up', fallback: { set: 'ionicons', name: 'share-outline' } },
  restore: { sf: 'square.and.arrow.down', fallback: { set: 'ionicons', name: 'download-outline' } },
  trash: { sf: 'trash.fill', fallback: { set: 'ionicons', name: 'trash' } },
  info: { sf: 'info.circle.fill', fallback: { set: 'ionicons', name: 'information-circle' } },
  person: { sf: 'person.fill', fallback: { set: 'ionicons', name: 'person' } },

  running: { sf: 'figure.run', fallback: { set: 'material', name: 'run' } },
  meditation: { sf: 'figure.mind.and.body', fallback: { set: 'material', name: 'meditation' } },
  book: { sf: 'book.fill', fallback: { set: 'ionicons', name: 'book' } },
  water: { sf: 'drop.fill', fallback: { set: 'ionicons', name: 'water' } },
  pill: { sf: 'pills.fill', fallback: { set: 'material', name: 'pill' } },
  walk: { sf: 'figure.walk', fallback: { set: 'material', name: 'walk' } },
  sleep: { sf: 'bed.double.fill', fallback: { set: 'material', name: 'bed' } },
  sun: { sf: 'sun.max.fill', fallback: { set: 'ionicons', name: 'sunny' } },
  heart: { sf: 'heart.fill', fallback: { set: 'ionicons', name: 'heart' } },
  dumbbell: { sf: 'dumbbell.fill', fallback: { set: 'material', name: 'dumbbell' } },
} as const satisfies Record<string, IconEntry>;

export type IconName = keyof typeof icons;
