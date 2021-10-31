<template>
  <div class="flex-container-row">
    <div class="sidebar">
      <div class="flex-container-column">
        <div class="flex-item">Spiele</div>
      </div>
    </div>
    <div class="games-panel">
      <div class="flex-container-grid">
        <div
          v-for="game in games"
          :key="game"
          class="game-tile"
          @click="startGame"
        >
          <img src="@/assets/GM8E01.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
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
        'Users/cib/Documents/Dolphin Emulator/StateSaves/GM8E01.s01'
      )
      const dolphin = toWindowsPath(
        'C',
        'Users/cib/Downloads/Dolphin-x64/Dolphin.exe'
      )
      const result = exec(
        `${dolphin} -e ${iso} -s ${saveState} --config "Dolphin.Display.Fullscreen=True" -b`
      )
      console.log('result', result)
      result.addListener('error', (error) => console.log('error', error))
      result.addListener('close', () => console.log('child process closed'))
    }

    return { games, startGame }
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
</style>
