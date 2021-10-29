import { cloneDeep } from 'lodash'
import { logError } from './error'

export interface ButtonPressEvent {
  buttonId: number
  value: number
}

type ButtonPressListener = (event: ButtonPressEvent) => void

interface ButtonState {
  pressed: boolean
  touched: boolean
  value: number
}

export class GamepadHandler {
  private listeners: ButtonPressListener[] = []
  private lastState?: ButtonState[]

  init(window: Window): void {
    window.addEventListener('gamepadconnected', function (e) {
      if (e instanceof GamepadEvent) {
        console.log('gamepad', e.gamepad)
      }
    })

    window.addEventListener('gamepaddisconnected', function (e) {
      if (e instanceof GamepadEvent) {
        console.log(
          'Gamepad disconnected from index %d: %s',
          e.gamepad.index,
          e.gamepad.id
        )
      }
    })
  }

  listenButtonEvent(listener: ButtonPressListener): void {
    this.listeners.push(listener)
  }

  handleGamepadEvents(): void {
    function buttonPressed(b: GamepadButton, last: ButtonState) {
      return b.pressed && !last.pressed
    }

    function getGamepad(): Gamepad | null {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
      if (!gamepads) {
        logError({
          label: 'gamepad.error.gamepadAPI',
        })
      }

      return gamepads[0]
    }

    const triggerButtonEvent = (event: ButtonPressEvent): void => {
      for (const listener of this.listeners) {
        listener(event)
      }
    }

    const gamepadLoop = () => {
      const gamepad = getGamepad()
      if (gamepad) {
        for (const [index, button] of gamepad.buttons.entries()) {
          const lastButton = this.lastState
            ? this.lastState[index]
            : { pressed: false, touched: false, value: 0 }
          if (buttonPressed(button, lastButton)) {
            triggerButtonEvent({
              buttonId: index,
              value: button.value,
            })
          }
        }
        this.lastState = cloneDeep(gamepad.buttons) as ButtonState[]
      }
      requestAnimationFrame(gamepadLoop)
    }

    gamepadLoop()
  }

  vibrateGamepad(gamepad: Gamepad): void {
    return (gamepad as any).vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: 500,
      weakMagnitude: 0.1,
      strongMagnitude: 0.5,
    })
  }
}

export const gamepadHandler = new GamepadHandler()
