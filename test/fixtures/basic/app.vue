<script lang="ts" setup>
import { useProvideNuxtUnity, useNuxtUnityOrThrow } from '../../../src/runtime/composables'
useProvideNuxtUnity(undefined)
const { NuxtUnity } = useNuxtUnityOrThrow()
</script>

<template>
  <div>
    <NuxtUnity
      width="600px"
      height="600px"
      unity-loader="/unity/Build.loader.js"
      :config="{
        dataUrl: '/unity/Build.data',
        frameworkUrl: '/unity/Build.framework.js',
        codeUrl: '/unity/Build.wasm',
      }"
    ></NuxtUnity>
  </div>
</template>
