import { Eventmitter } from 'eventmit'

export type EventmitterValueType = Record<string, any>
export type EventmitFactory = (key: string, forceNew?: boolean) => Eventmitter<EventmitterValueType>

// https://docs.unity3d.com/ja/2021.3/Manual/webgl-templates.html
export interface UnityInstance extends Record<string, any> {
  SetFullscreen: (fullScreen: 0 | 1) => void
  SendMessage: (gameObject: string, method: string, param?: any) => void
  Quit: () => Promise<void>
}

declare global {
  var createUnityInstance: (
    canvas: Element,
    config: { [key: string]: any },
    onProgress?: Function
  ) => Promise<UnityInstance>
  var $nuxtUnityEvent: EventmitFactory
}
