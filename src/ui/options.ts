import { createApp } from "vue";
import Options from "@/ui/Options.vue";
import router from "@/ui/router";
import store from "@/ui/store";

createApp(Options).use(store).use(router).mount("#app");
