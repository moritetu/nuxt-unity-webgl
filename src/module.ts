import { defineNuxtModule, addPlugin, createResolver, addImports } from '@nuxt/kit'

export interface ModuleOptions {
  autoImports?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unity-webgl',
    configKey: 'nuxtUnity',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    autoImports: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)

    if (options.autoImports) {
      addImports([
        {
          name: 'useProvideNuxtUnity',
          as: 'useProvideNuxtUnity',
          from: resolver.resolve(runtimeDir, 'composables'),
        },
        {
          name: 'useNuxtUnity',
          as: 'useNuxtUnity',
          from: resolver.resolve(runtimeDir, 'composables'),
        },
        {
          name: 'useNuxtUnityOrThrow',
          as: 'useNuxtUnityOrThrow',
          from: resolver.resolve(runtimeDir, 'composables'),
        },
      ])
    }

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
