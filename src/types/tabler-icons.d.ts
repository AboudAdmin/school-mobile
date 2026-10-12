// Per-icon deep imports (`@tabler/icons-react-native/IconChevronRight`) keep the bundle small; the package ships no per-icon typings.
declare module '@tabler/icons-react-native/*' {
  import type { ComponentType } from 'react';
  import type { SvgProps } from 'react-native-svg';
  const TablerIcon: ComponentType<SvgProps & { size?: number | string; strokeWidth?: number | string; color?: string }>;
  export default TablerIcon;
}
