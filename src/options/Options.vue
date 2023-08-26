<script setup lang="ts">
import { storageDemo } from "~/logic/storage";
import SharedSubtitle from "~/components/SharedSubtitle.vue";
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <img src="/assets/icon-128.png" class="icon-btn mx-2 text-2xl" alt="extension icon">
    <div>Options</div>
    <SharedSubtitle />

    <input v-model="storageDemo" class="border border-gray-400 rounded px-2 py-1 mt-2">

    <div class="mt-4">
      Powered by <a href="https://github.com/kirklin/boot-webext">Boot WebExt</a>
    </div>
  </main>
</template>
