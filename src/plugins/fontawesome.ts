import { App } from '@vue/runtime-core'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPhone } from '@fortawesome/free-solid-svg-icons'

library.add(faPhone)

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export const fontawesomePlugin = {
  install(app: App) {
    app.component('font-awesome-icon', FontAwesomeIcon)
  },
}
