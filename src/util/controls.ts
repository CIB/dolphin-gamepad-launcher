import { ButtonPressEvent, gamepadHandler } from './gamepad'

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

const axisMap: { [key: string]: ControlsEvent } = {
  '0+': 'RIGHT',
  '0-': 'LEFT',
  '1+': 'DOWN',
  '1-': 'UP',
}

function axisEvent(event: ButtonPressEvent): ControlsEvent | null {
  const sign = event.value >= 0 ? '+' : '-'
  const key = `${event.buttonId}${sign}`
  return key in axisMap ? axisMap[key] : null
}

const buttonHeldIntervals = [320, 120, 100]
export class Controls {
  heldDirection: ControlsEvent | null = null
  heldAxis: number | null = null
  heldInterval = 0
  activeLoop: NodeJS.Timeout | null = null

  listen(cb: (event: ControlsEvent) => void): void {
    gamepadHandler.listenButtonEvent((event) => {
      const key = event.buttonId.toString() as ControlsEvent
      let controlsEvent: ControlsEvent | null = null
      const value = Math.sign(Math.round(event.value))

      if (event.type === 'button' && key in buttonMap) {
        controlsEvent = buttonMap[key]
      } else if (event.type === 'axis') {
        controlsEvent = axisEvent(event)
      }

      if (controlsEvent) {
        if (this.heldDirection) {
          if (this.heldDirection !== controlsEvent || !value) {
            if (this.activeLoop) {
              clearTimeout(this.activeLoop)
            }
            this.heldDirection = null
            this.heldAxis = event.buttonId
            this.heldInterval = 0
          }
        }
        if (value !== 0) {
          this.heldDirection = controlsEvent
          this.heldInterval = 0

          const loopCallback = () => {
            cb(controlsEvent!)
            console.log(buttonHeldIntervals[this.heldInterval])
            this.activeLoop = setTimeout(
              loopCallback,
              buttonHeldIntervals[this.heldInterval]
            )
            this.heldInterval = Math.min(
              this.heldInterval + 1,
              buttonHeldIntervals.length - 1
            )
          }
          loopCallback()
        }
      }
    })
  }
}

export const controls = new Controls()
