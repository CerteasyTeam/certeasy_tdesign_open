/* eslint-disable simple-import-sort/imports */
import TDesign from 'tdesign-vue-next';
import { createApp } from 'vue';
import VueGtag from 'vue-gtag-next';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/tailwind.css';
import '@/style/index.less';
import './permission';

const app = createApp(App);
// google
app.use(VueGtag, {
  property: { id: 'G-DLCELCGKG4' },
});
// 注册全局组件
import CopyLabel from './components/copy-label/index.vue';
import PageNav from './components/page-nav/index.vue';

app.component('CopyLabel', CopyLabel);
app.component('PageNav', PageNav);

app.use(TDesign);
app.use(store);
app.use(router);
app.use(i18n);

app.mount('#app');
