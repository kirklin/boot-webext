import { createApp } from "vue";
import Popup from "@/ui/Popup.vue";
import router from "@/ui/router";
import store from "@/ui/store";

createApp(Popup).use(store).use(router).mount("#app");
