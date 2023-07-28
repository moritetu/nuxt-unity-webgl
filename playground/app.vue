<script lang="ts" setup>
import { useNuxtApp } from '#app'
import { useProvideNuxtUnity, useNuxtUnityOrThrow, ref } from '#imports'

useProvideNuxtUnity(undefined, (unity) => {
  // eslint-disable-next-line no-console
  console.log(unity)
})
const { NuxtUnity, loaded, loading, quitted, SendMessage, quit } = useNuxtUnityOrThrow()
const sayHello = () => {
  SendMessage('GameObject', 'hello', { message: 'Hello from web' })
}
const nuxtApp = useNuxtApp()
nuxtApp.$nuxtUnityEvent('nuxt-unity:ready').on(({ providerId, unityInstance }) => {
  // eslint-disable-next-line no-console
  console.log(providerId, unityInstance)
})
nuxtApp.$nuxtUnityEvent('hello').on(({ message }) => {
  messageFromJslib.value = '...'
  // eslint-disable-next-line no-console
  console.log(message)
  messageFromJslib.value = message
})
const messageFromJslib = ref('-')
</script>

<template>
  <div class="container">
    <div class="status">
      <div class="flags">
        <span
          >Loading: <code>{{ loading }}</code></span
        >
        <span>
          Loaded: <code>{{ loaded }} </code></span
        >
        <span
          >Quitted: <code>{{ quitted }}</code></span
        >
      </div>
      <div>
        <button @click="quit">Quit</button> <button @click="sayHello">SayHello</button> message:
        <code>{{ messageFromJslib }}</code>
      </div>
    </div>
    <NuxtUnity
      width="500px"
      height="500px"
      unity-loader="/unity/build.loader.js"
      :config="{
        dataUrl: '/unity/build.data',
        frameworkUrl: '/unity/build.framework.js',
        codeUrl: '/unity/build.wasm',
      }"
    ></NuxtUnity>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  height: 100vh;
}

.unity-container {
  width: 100%;
  height: 100%;
}

.status .flags span {
  padding-right: 1rem;
}
</style>
