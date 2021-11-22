import { createApp } from 'vue'
import { fontawesomePlugin } from './plugins/fontawesome'
import App from './App.vue'
import router from './router'

import { gamepadHandler } from './util/gamepad'

gamepadHandler.init(window)
gamepadHandler.handleGamepadEvents()
gamepadHandler.listenButtonEvent((event) => {
  console.log('event!', event)
})

const app = createApp(App).use(fontawesomePlugin).use(router).mount('#app')
