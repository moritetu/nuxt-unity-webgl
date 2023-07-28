import { type Eventmitter, eventmit } from 'eventmit'
import { EventmitterValueType } from './types'
import { defineNuxtPlugin } from '#imports'

type EventmitFactory = (key: string, forceNew?: boolean) => Eventmitter<EventmitterValueType>

declare global {
  const $nuxtUnityEvent: EventmitFactory
}

export declare module '#app' {
  interface NuxtApp {
    $nuxtUnityEvent: EventmitFactory
    $nuxtUnityRefresh: () => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $nuxtUnityEvent: EventmitFactory
    $nuxtUnityRefresh: () => void
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $nuxtUnityEvent: EventmitFactory
    $nuxtUnityRefresh: () => void
  }
}

export default defineNuxtPlugin(() => {
  const emitters = new Map<string, Eventmitter<EventmitterValueType>>()

  function eventmitFactory(key: string, forceNew = false) {
    if (forceNew || !emitters.has(key)) {
      emitters.set(key, eventmit<EventmitterValueType>())
    }
    return emitters.get(key)
  }

  const refresh = () => emitters.clear()

  globalThis.$nuxtUnityEvent = eventmitFactory

  return {
    provide: {
      nuxtUnityEvent: eventmitFactory,
      nuxtUnityRefresh: refresh,
    },
  }
})
