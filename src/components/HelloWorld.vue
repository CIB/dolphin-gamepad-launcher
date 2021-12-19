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
import { defineComponent, onBeforeUpdate, onMounted, Ref, ref } from 'vue'
import { sortBy } from 'lodash'
import { controls, ControlsEvent } from '@/util/controls'
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
      const iso = toWindowsPath('C', 'Users/cib12/games/gc/mprime.gcm')
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
      result.addListener('message', (msg) => console.log('msg', msg))
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
    const selected: Ref<HTMLElement | null> = ref(null)
    let selectedIndex = 0
    const addItemRef = (el: HTMLElement) => {
      console.log('pushing ref', el)
      allRefs = allRefs.concat([el])
    }

    const findClosestItemInDirection = (
      direction: ControlsEvent
    ): HTMLElement => {
      console.log('direction', direction)
      if (!selected.value) {
        return allRefs[0]
      }
      const boundingBox = selected.value.getBoundingClientRect()

      interface DirectionHandlers {
        customFilter: (item: DOMRect, base: DOMRect) => boolean
        mainDistance: (item: DOMRect, base: DOMRect) => number
        weakDistance: (item: DOMRect, base: DOMRect) => number
      }

      const directionHandlers: { [key: string]: DirectionHandlers } = {
        RIGHT: {
          customFilter: (item: DOMRect, base: DOMRect) =>
            item.left >= base.left,
          mainDistance: (item: DOMRect, base: DOMRect) =>
            Math.abs(item.y - base.y),
          weakDistance: (item: DOMRect, base: DOMRect) =>
            item.left - base.right,
        },
        LEFT: {
          customFilter: (item: DOMRect, base: DOMRect) =>
            item.right <= base.right,
          mainDistance: (item: DOMRect, base: DOMRect) =>
            Math.abs(item.y - base.y),
          weakDistance: (item: DOMRect, base: DOMRect) =>
            base.left - item.right,
        },
        UP: {
          customFilter: (item: DOMRect, base: DOMRect) =>
            item.bottom <= base.bottom,
          mainDistance: (item: DOMRect, base: DOMRect) =>
            Math.abs(item.x - base.x),
          weakDistance: (item: DOMRect, base: DOMRect) =>
            base.top - item.bottom,
        },
        DOWN: {
          customFilter: (item: DOMRect, base: DOMRect) => item.top >= base.top,
          mainDistance: (item: DOMRect, base: DOMRect) =>
            Math.abs(item.x - base.x),
          weakDistance: (item: DOMRect, base: DOMRect) =>
            item.top - base.bottom,
        },
      }

      const directionHandler = directionHandlers[direction]
      if (!directionHandler) {
        return selected.value
      }
      const items = allRefs.filter(
        (item) =>
          directionHandler.customFilter(
            item.getBoundingClientRect(),
            boundingBox
          ) && item !== selected.value
      )
      console.log(
        'items',
        items.map((item) => [
          item.getBoundingClientRect().x,
          item.getBoundingClientRect().y,
        ])
      )
      const nextItem = sortBy(items, (item) => {
        const rect = item.getBoundingClientRect()
        const xDistance = directionHandler.weakDistance(rect, boundingBox)
        const yDistance = directionHandler.mainDistance(rect, boundingBox)

        return 1000 * yDistance + xDistance
      })[0]
      return nextItem || selected.value
    }

    controls.listen((event) => {
      const nextItem = findClosestItemInDirection(event)
      selected.value = nextItem
      nextItem.focus()
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

function ControlsEvent(direction: any, ControlsEvent: any) { throw new
Error('Function not implemented.') } function ControlsEvent(direction: any,
ControlsEvent: any) { throw new Error('Function not implemented.') }
