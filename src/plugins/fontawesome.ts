import { App } from '@vue/runtime-core'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPhone, faGamepad, faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(faPhone, faGamepad, faWrench)

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export const fontawesomePlugin = {
  install(app: App) {
    app.component('font-awesome-icon', FontAwesomeIcon)
  },
}
