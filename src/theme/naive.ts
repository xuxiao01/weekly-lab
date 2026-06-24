import type { GlobalThemeOverrides } from 'naive-ui'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0F766E',
    primaryColorHover: '#047857',
    primaryColorPressed: '#065F46',
    primaryColorSuppl: '#0F766E',
    borderRadius: '10px',
  },
  Button: {
    borderRadiusMedium: '10px',
    heightMedium: '44px',
    fontWeight: '700',
  },
  Input: {
    borderRadius: '10px',
    heightMedium: '44px',
  },
  Card: {
    borderRadius: '20px',
  },
}
