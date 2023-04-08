import EventEmitter from 'eventemitter3'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  const eventEmitter = new EventEmitter()
  if (process.client) {
    window.$nuxtUnityEvent = eventEmitter
  }
  return {
    provide: {
      nuxtUnityEvent: eventEmitter,
    },
  }
})
