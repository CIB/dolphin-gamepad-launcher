import { cloneDeep, round } from 'lodash'
import { logError } from './error'

export interface ButtonPressEvent {
  type: 'button' | 'axis'
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
  private lastAxesState?: number[]

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
              type: 'button',
              buttonId: index,
              value: button.value,
            })
          }
        }
        for (const [index, axis] of gamepad.axes.entries()) {
          const lastValue = this.lastAxesState ? this.lastAxesState[index] : 0
          const axisDirection = (axisValue: number) =>
            Math.sign(round(axisValue, 0))
          if (axisDirection(lastValue) !== axisDirection(axis)) {
            triggerButtonEvent({
              type: 'axis',
              buttonId: index,
              value: axis,
            })
          }
        }
        this.lastState = cloneDeep(gamepad.buttons) as ButtonState[]
        this.lastAxesState = cloneDeep(gamepad.axes) as number[]
      }
      requestAnimationFrame(gamepadLoop)
    }

    gamepadLoop()
  }

  vibrateGamepad(gamepad: Gamepad): void {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (gamepad as any).vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: 500,
      weakMagnitude: 0.1,
      strongMagnitude: 0.5,
    })
  }
}

export const gamepadHandler = new GamepadHandler()
