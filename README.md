# nuxt-unity-webgl

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

nuxt-unity-webgl introduces component and utilities for unity WebGL container.

## Features

<!-- Highlight some of the features your module provide here -->

- ⛰ &nbsp;Add the unity canvas to your site easily

## Quick Setup

1. Add `nuxt-unity-webgl` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-unity-webgl

# Using yarn
yarn add --dev nuxt-unity-webgl

# Using npm
npm install --save-dev nuxt-unity-webgl
```

2. Add `nuxt-unity-webgl` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-unity-webgl'],
})
```

That's it! You can now use NuxtUnityWebGL in your Nuxt app ✨

## Basic usage

You can get `NuxtUnity` by calling `useNuxtUnityOrThrow()` or `useNuxtUnity()` composables.

```typescript
<script lang="ts" setup>
useProvideNuxtUnity(undefined, (unity) => {
  // eslint-disable-next-line no-console
  console.log(unity)
})
const { NuxtUnity, loaded, SendMessage } = useNuxtUnityOrThrow()
const callUnityFunction = () => {
  // scalar or json object are enable as argument
  SendMessage('GameObject', 'HelloMethod', { message: 'hello' })
}
const nuxtApp = useNuxtApp()

nuxtApp.$nuxtUnityEvent.on('nuxt-unity:ready', (providerId, unityInstance) => {
  // eslint-disable-next-line no-console
  console.log(providerId, unityInstance)
})

nuxtApp.$nuxtUnityEvent.on('hello', (message: string) => {
  // eslint-disable-next-line no-console
  console.log(message)
})
</script>

<template>
  <div class="container">
    <NuxtUnity
      width="500px"
      height="500px"
      unity-loader="/unity/Build.loader.js"
      :config="{
        dataUrl: '/unity/Build.data',
        frameworkUrl: '/unity/Build.framework.js',
        codeUrl: '/unity/Build.wasm',
      }"
      :resizable="true"
      :refresh-delay-time="100"
    ></NuxtUnity>
  </div>
  <button @click="callUnityFunction">SendMessage</button>
</template>
```

And you can send messages to the unity game object with `SendMessage()`.

```c#
// HelloController.cs
using System;
using UnityEngine;
using System.Runtime.InteropServices;

public class HelloController : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void JSLibFunction();

    [Serializable]
    public class HelloProps
    {
        public string message;
    }

    public void hello(string json)
    {
        HelloProps props = JsonUtility.FromJson<HelloProps>(json);
        Debug.Log(props.message);
        JSLibFunction();
    }
}
```

`emit` or `handle` some events via `$nuxtUnityEvent` in `.jslib`.

```javascript
// Sample.jslib
mergeInto(LibraryManager.library, {
  JSLibFunction: function () {
    $nuxtUnityEvent.emit('hello', 'Hello from unity jslib')
  },
})
```

## Composables

### `useProvideUnity(initialValue, callback)`

Injects unity store.

```typescript
// initialValue: unity instance
// callback    : (unityInstance) => void
useProvideUnity(undefined, (unity) => {
  console.log(unity) // The unity instance
})
```

### `useNuxtUnity()`

Return the store, it is nullable. We uses `createInjectionState` of `VueUse`, so see [VueUse Documents](createInjectionState) in more details.

- `NuxtUnity` - NuxtUnity vue component
- `unity` - Unity instance initialized by `createUnityInstance()`
- `loading` - Loading state of the unity instance
- `loaded` - Loaded state of the unity instance
- `quitted` - Quitted state of the unity instance
- `quit` - Function to quit unity
- `error` - Error if unity loading fails
- `SendMessage` - Utility function to send the unity game object
- `nuxtUnityEvent` - EventEmitter for unity-nuxt
  - `nuxt-unity:ready` - Hook called when unity instance created
  - `nuxt-unity:quit` - Hook called when unity instance quitted

### `useNuxtUnityOrThrow()`

Return the store. If the store is null, error thrown.

## Unity Component Attributes

### `width`

- Type: `string`
- Required: `true`

Canvas width `px`.

### `height`

- Type: `string`
- Required: `true`

Canvas height `px`.

### `unityLoader`

- Type: `string`
- Required: `true`

Unity loader script.

### `config`

- Type: `Object`
- Required: `true`

Configuration passed to an utity instance.

### `onProgress`

- Type: `Function`
- Required: `false`
- Default:

```typescript
;(progress: number) => {
  console.log(`unity loading... ${progress * 100}%`)
}
```

Callback function called in loading.

### `resizable`

- Type: `Boolean`
- Required: `false`

Enable auto resizing canvas when window resizing. `true` is enable.

### `refreshDelayTime`

- Type: `Number`
- Required: `false`
- Default: `200`

Delay millseconds time to resize canvas after window resized.

### `onQuit`

- Type: `Boolean`
- Required: `false`
- Default:

```typescript
;() => {
  console.log('quit unity')
}
```

Callback function called on `onBeforeUnmount` lifecycle hook.

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-unity-webgl/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-unity-webgl
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-unity-webgl.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-unity-webgl
[license-src]: https://img.shields.io/npm/l/nuxt-unity-webgl.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-unity-webgl
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
