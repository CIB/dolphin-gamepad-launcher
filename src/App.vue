<template>
  <router-view />
</template>

<style lang="scss">
@import '@/scss/app.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $color-fg;
  background-color: $color-bg;
  min-height: 100%;
}

// Make app fullscreen
html,
body {
  height: 100%;
  margin: 0;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
