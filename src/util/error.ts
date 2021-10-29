import { Dictionary } from 'lodash'

export interface ErrorMessage {
  label: string
  args?: Dictionary<string>
  permanent?: boolean
}

export function logError(msg: ErrorMessage): void {
  console.error(msg.label, msg.args)
}
