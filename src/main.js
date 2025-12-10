import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style/main.scss";
import "./style/content-style.scss";
import axios from "axios";

const app = createApp(App);

app.use(createPinia());
app.use(router);
// axios 不是 Vue 插件，不应通过 app.use 注入

app.mount("#app");
