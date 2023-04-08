import EventEmitter from 'eventemitter3'
import { useScriptTag, useResizeObserver } from '@vueuse/core'
import { defu } from 'defu'
import {
  type InjectionKey,
  inject,
  provide,
  ref,
  defineComponent,
  h,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  shallowRef,
} from 'vue-demi'
import { useState, useNuxtApp } from '#app'

// https://docs.unity3d.com/ja/2021.3/Manual/webgl-templates.html
export interface UnityInstance extends Record<string, any> {
  SetFullscreen: (fullScreen: 0 | 1) => void
  SendMessage: (gameObject: string, method: string, param?: any) => void
  Quit: () => Promise<void>
}

declare global {
  interface Window {
    createUnityInstance(canvas: Element, config: { [key: string]: any }, onProgress?: Function): Promise<UnityInstance>
    $nuxtUnityEvent: EventEmitter
  }
}

const getKey = () => Number(Math.random().toString().slice(3)).toString(36)

/**
 * This implementation get hints from vueuse
 * @see https://vueuse.org/createInjectionState
 */
function createInjectionState<Arguments extends Array<any>, Return>(
  composable: (...args: Arguments) => Return
): readonly [useProvidingState: (...args: Arguments) => void, useInjectedState: () => Return | undefined] {
  const key: string | InjectionKey<Return> = Symbol('UnityInjectionState')
  const useProvidingState = (...args: Arguments) => {
    provide(key, composable(...args))
  }
  // If called from same vm, jnject with self
  const useInjectedState = () => injectWithSelf(key)
  return [useProvidingState, useInjectedState]
}

// Define composable refs and Unity component
const [useProvideNuxtUnity, useNuxtUnity] = createInjectionState(
  (initialValue?: any, callback?: (unityInstance: any) => void) => {
    const { $nuxtUnityEvent } = useNuxtApp()
    const unity = shallowRef<UnityInstance | null>(initialValue)
    const loaded = ref(false)
    const loading = ref(false)
    const quitted = ref(false)
    const error = ref<Error>()
    const providerId = useState('unityProviderId', getKey)

    function SendMessage<T = any>(gameObject: string, method: string, param?: T) {
      if (!loaded.value || !unity.value) {
        return
      }

      if (param) {
        unity.value.SendMessage(gameObject, method, typeof param === 'object' ? JSON.stringify(param) : param)
      } else {
        unity.value.SendMessage(gameObject, method)
      }
    }

    function done(unityInstance: UnityInstance) {
      if (loaded.value) {
        return
      }
      unity.value = unityInstance
      loaded.value = true
      loading.value = false

      if (callback) {
        callback(unityInstance)
      }
    }

    async function quit() {
      if (!loaded.value || !unity.value) {
        return
      }
      await unity.value.Quit().then(() => {
        quitted.value = true
        $nuxtUnityEvent.emit('nuxt-unity:quit', providerId.value, unity.value)
      })
    }

    //
    // Define Unity component which is available in sfc's template.
    //
    const UnityComponent = defineComponent({
      name: 'NuxtUnityContainer',
      props: {
        width: {
          type: String,
          required: true,
        },
        height: {
          type: String,
          required: true,
        },
        unityLoader: {
          type: String,
          required: true,
        },
        onProgress: {
          type: Function,
          default: (progress: number) => {
            // eslint-disable-next-line no-console
            console.log(`unity loading... ${progress * 100}%`)
          },
        },
        config: {
          type: Object,
          required: true,
        },
        resizable: {
          type: Boolean,
          default: true,
        },
        refreshDelayTime: {
          type: Number,
          default: 200,
        },
        resetOnRefresh: {
          type: Boolean,
          default: false,
        },
        onQuit: {
          type: Function,
          default: () => {
            // eslint-disable-next-line no-console
            console.log('quit unity')
          },
        },
      },
      emits: ['loading', 'loaded', 'error', 'quitting', 'quit'],
      setup(props, context) {
        const unityLoaderLoaded = ref(false)
        const canvasWidth = ref(props.width)
        const canvasHeight = ref(props.height)
        const container = shallowRef<HTMLElement>()
        const canvas = shallowRef<HTMLElement>()

        const config = defu(props.config, {
          dataUrl: 'Build.data',
          frameworkUrl: 'Build.framework.js',
          codeUrl: 'Build.wasm',
          companyName: 'DefaultCompany',
          productName: 'UnityApp',
          productVersion: '0.1',
          showBanner: false,
          onQuit: props.onQuit,
        })

        function instantiate() {
          if (typeof window.createUnityInstance === 'undefined' && unityLoaderLoaded.value) {
            const _error = 'Failed to load unityloader'
            error.value = new Error(_error)
            context.emit('error', _error)
            return
          }

          if (loading.value) {
            return
          }

          loading.value = true
          context.emit('loading')

          const canvas = document.querySelector(`#unity-canvas-${providerId.value}`)
          window
            .createUnityInstance(canvas!, config, props.onProgress)
            .then((unityInstance) => {
              done(unityInstance)
              $nuxtUnityEvent.emit('nuxt-unity:ready', providerId.value, unityInstance)
              context.emit('loaded')
            })
            .catch((message) => {
              error.value = new Error(message)
              context.emit('error')
            })
        }

        const { load } = useScriptTag(
          props.unityLoader,
          () => {
            unityLoaderLoaded.value = true
            instantiate()
          },
          { manual: true }
        )

        onBeforeMount(() => {
          load()
        })

        onMounted(() => {
          let debounceTimer: ReturnType<typeof setTimeout> | null

          useResizeObserver(container, (entries) => {
            if (!props.resizable) {
              return
            }
            const entry = entries[0]
            const { clientWidth, clientHeight } = entry.target

            // Make canvas resizing delayed to suppress monitor flickering.
            if (debounceTimer) {
              clearTimeout(debounceTimer)
              debounceTimer = null
            }

            if (props.resetOnRefresh) {
              canvasWidth.value = '0px'
              canvasHeight.value = '0px'
            }

            debounceTimer = setTimeout(() => {
              canvasWidth.value = clientWidth + 'px'
              canvasHeight.value = clientHeight + 'px'
            }, props.refreshDelayTime)
          })
        })

        onBeforeUnmount(() => {
          if (!unity.value) {
            return
          }

          context.emit('quitting')

          if (unity.value) {
            quit()
              .then(() => props.onQuit())
              .then(() => {
                context.emit('quit')
                unity.value = null
                container.value?.remove()
              })
          }
        })

        return { canvasWidth, canvasHeight, container, canvas }
      },
      render() {
        return h(
          'div',
          {
            id: `unity-container-${providerId.value}`,
            'provider-id': providerId.value,
            class: 'unity-container',
            ref: 'container',
          },
          [
            h(
              'canvas',
              {
                id: `unity-canvas-${providerId.value}`,
                class: 'unity-canvas',
                style: {
                  width: this.canvasWidth,
                  height: this.canvasHeight,
                  display: 'block',
                },
                ref: 'canvas',
              },
              []
            ),
            h('div', { class: 'unity-extra-content' }, this.$slots.default?.()),
          ]
        )
      },
    })

    return {
      unity,
      loading,
      loaded,
      quitted,
      quit,
      error,
      SendMessage,
      providerId,
      NuxtUnity: UnityComponent,
    }
  }
)

export { useProvideNuxtUnity, useNuxtUnity }

export function useNuxtUnityOrThrow() {
  const store = useNuxtUnity()
  if (store == null) {
    throw new Error('Please call `useProvideUnity` on the appropriate parent component')
  }
  return store
}

// Uses same component provide as its own injections
// Due to changes in https://github.com/vuejs/vue-next/pull/2424
// @see https://github.com/logaretm/vee-validate
function injectWithSelf<T>(symbol: InjectionKey<T>, def: T | undefined = undefined): T | undefined {
  const vm = getCurrentInstance() as any
  return vm?.provides[symbol as any] || inject(symbol, def)
}
