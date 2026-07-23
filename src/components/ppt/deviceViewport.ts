export interface DeviceViewportRow {
  viewport: string
  count?: string
  share?: string
  cumulativeCoverage?: string
  detail?: string
}

export type DeviceViewportVariant =
  | 'ipad'
  | 'iphone'
  | 'android-tablet'
  | 'android-phone'

export type DeviceViewportTableMode = 'metrics' | 'details'
