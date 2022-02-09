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
import {
  defineComponent,
  onBeforeUpdate,
  onMounted,
  Ref,
  ref,
  watch,
} from 'vue'
import { sortBy } from 'lodash'
import { controls, DirectionEvent } from '@/util/controls'
import { dolphinLauncher } from '@/util/dolphin-launcher'
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
    const inGame = ref(false)
    function startGame() {
      if (!inGame.value) {
        inGame.value = true
        const iso = '/run/media/cib/A8D22880D228553A/data/games/gc/mprime.gcm'
        const saveState = '~/.local/share/dolphin-emu/StateSaves/GM8E01.s01'
        dolphinLauncher.launch(iso, saveState, () => {
          console.log('closing!')
          inGame.value = false
        })
      }
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
    const addItemRef = (el: HTMLElement) => {
      console.log('pushing ref', el)
      allRefs = allRefs.concat([el])
    }

    const findClosestItemInDirection = (
      direction: DirectionEvent
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

    controls.listenDirection((event) => {
      const nextItem = findClosestItemInDirection(event)
      selected.value = nextItem
    })
    controls.listenAction((event) => {
      if (event === 'A') {
        startGame()
      }
    })

    watch(selected, (newItem, oldItem) => {
      if (oldItem) {
        oldItem.classList.remove('is-selected')
      }
      if (newItem) {
        newItem.classList.add('is-selected')
      }
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

.is-selected {
  background-color: rgba(255, 94, 0, 0.5);
}

.is-selected > img {
  opacity: 0.5;
}
</style>
