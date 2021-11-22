import { gamepadHandler } from './gamepad'

export type ControlsEvent =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'LEFTUP'
  | 'RIGHTUP'
  | 'LEFTDOWN'
  | 'RIGHTDOWN'

const buttonMap: { [key: string]: ControlsEvent } = {
  '12': 'UP',
  '13': 'DOWN',
  '14': 'LEFT',
  '15': 'RIGHT',
}

export class Controls {
  listen(cb: (event: ControlsEvent) => void): void {
    gamepadHandler.listenButtonEvent((event) => {
      const key = event.buttonId.toString()
      console.log('key', key)
      if (event.type === 'button' && key in buttonMap) {
        cb(buttonMap[key])
      }
    })
  }
}

export const controls = new Controls()
