import { createApp } from 'vue';
import App from './App.vue';

// Setup app
const app = createApp(App);

// Provide global context
app.config.globalProperties.$app = {
  context: 'options'
};

app.provide('app', app.config.globalProperties.$app);

// Mount
app.mount('#app');

export {};
