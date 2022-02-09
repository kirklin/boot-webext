<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <div>
      <button v-on:click="sendMsg">Send Message to content.js</button>
    </div>
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/ui/components/HelloWorld.vue"; // @ is an alias to /src
import { sendTestMsg } from "@/ui/utils/chromeHelper";
import { log } from "@/core/util";

export default defineComponent({
  name: "Home",
  components: {
    HelloWorld,
  },
  methods: {
    sendMsg() {
      log("sent message");
      sendTestMsg()
        .then((res) => {
          log(res);
        })
        .catch((err) => {
          log(err);
        });
    },
  },
});
</script>
