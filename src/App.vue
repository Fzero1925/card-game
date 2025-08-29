<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
</script>

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
