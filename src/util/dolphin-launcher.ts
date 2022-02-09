import { exec } from 'child_process'

type DolphinConfig = { [key: string]: any }

function fromConfig(options: DolphinConfig): string {
  return Object.keys(options)
    .map((key) => `--config "${key}=${options[key]}"`)
    .join(' ')
}

export class DolphinLauncher {
  dolphinExecutable = 'dolphin-emu'

  launch(iso: string, saveState: string, onClose: () => void): void {
    const config: DolphinConfig = {
      'Dolphin.Display.Fullscreen': 'True',
    }
    const configString = fromConfig(config)
    console.log(
      'command',
      `${this.dolphinExecutable} -e ${iso} -s ${saveState} ${configString} -b`
    )
    const childProcess = exec(
      `${this.dolphinExecutable} -e ${iso} -s ${saveState} ${configString} --confirm=False -b`
    )

    console.log('result', childProcess)
    childProcess.addListener('message', (msg) => console.log('msg', msg))
    childProcess.addListener('error', (error) => console.log('error', error))
    childProcess.addListener('exit', onClose)
  }
}

export const dolphinLauncher = new DolphinLauncher()
