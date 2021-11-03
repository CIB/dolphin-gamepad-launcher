<template>
  <div class="flex-container-row">
    <div class="sidebar">
      <div class="flex-container-column">
        <div class="flex-item" :ref="addItemRef" tabindex="0">Spiele</div>
      </div>
    </div>
    <div class="games-panel">
      <div class="flex-container-grid">
        <div
          v-for="game in games"
          :key="game"
          class="game-tile"
          @click="startGame"
          :ref="addItemRef"
          tabindex="0"
        >
          <img src="@/assets/GM8E01.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onMounted, ref } from 'vue'
import { gamepadHandler } from '@/util/gamepad'
import { exec } from 'child_process'
import * as path from 'path'

function toWindowsPath(driveLetter: string, somePath: string): string {
  return `"${driveLetter}:\\${path.join(...somePath.split(path.posix.sep))}"`
}

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup() {
    const games = ref([0, 1, 2, 3, 4, 5, 6, 7, 8])
    function startGame() {
      const iso = toWindowsPath('E', 'data/games/gc/mprime.gcm')
      const saveState = toWindowsPath(
        'C',
        'Users/cib12/Documents/Dolphin Emulator/StateSaves/GM8E01.s01'
      )
      const dolphin = toWindowsPath(
        'C',
        'Users/cib12/games/Dolphin-x64/Dolphin.exe'
      )
      const result = exec(
        `${dolphin} -e ${iso} -s ${saveState} --config "Dolphin.Display.Fullscreen=True" -b`
      )
      console.log('result', result)
      result.addListener('error', (error) => console.log('error', error))
      result.addListener('close', () => console.log('child process closed'))

      selectedIndex = (selectedIndex + 1) % 10
      allRefs[selectedIndex].focus()
    }

    onMounted(() => {
      console.log('tiles', allRefs)
      console.log('tiles', allRefs[0])
      allRefs[0].focus()
    })

    onBeforeUpdate(() => {
      allRefs = []
    })

    let allRefs = [] as HTMLElement[]
    let selectedIndex = 0
    const addItemRef = (el: HTMLElement) => {
      console.log('pushing ref', el)
      allRefs = allRefs.concat([el])
    }

    gamepadHandler.listenButtonEvent(() => {
      selectedIndex = (selectedIndex + 1) % 10
      allRefs[selectedIndex].focus()
    })

    return { games, addItemRef, startGame }
  },
})
</script>

<style scoped lang="scss">
.flex-container-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
}

.games-panel {
  width: 100%;
  flex-grow: 1;
}
.flex-container-grid {
  display: flex;
  justify-content: center;
  flex-direction: row;
  width: 100%;
  height: 100%;
  row-gap: 32px;
  column-gap: 32px;
  max-width: 100%;
  flex-wrap: wrap;
}

.game-tile {
  width: 160px;
  height: 224px;
  border-style: dotted;
  border-width: 3px;
  background-color: #333;
}

.sidebar {
  justify-self: flex-start;
  flex-grow: 0;
}

.flex-container-column {
  display: flex;
  flex-direction: column;
  width: 100px;
  border-style: solid;
  border-width: 2px;
  height: 100%;
}
.flex-item {
  width: 100%;
}

:focus {
  background-color: rgba(255, 94, 0, 0.5);
}

:focus > img {
  opacity: 0.5;
}
</style>
