export type Station = { name: string; url: string }

declare module 'claude-code' {
  interface PluginState {
    'radio-multi': { stations: Station[]; name: string; url: string; error: string }
  }
}
