import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { gamepadHandler } from './util/gamepad'

gamepadHandler.init(window)
gamepadHandler.handleGamepadEvents()
gamepadHandler.listenButtonEvent((event) => {
  console.log('event!', event)
})

createApp(App).use(router).mount('#app')
