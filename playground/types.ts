import { EventEmitter } from 'eventemitter3'

declare module '#app' {
  interface NuxtApp {
    $nuxtUnityEvent: EventEmitter
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $nuxtUnityEvent: EventEmitter
  }
}

export {}
