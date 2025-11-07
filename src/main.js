import './assets/main.css'
import "vue-toastification/dist/index.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Toast from "vue-toastification"
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
})

app.use(VCalendar, {})
app.use(VueTelInput, {
    mode: 'international',
    autoDefaultCountry: true,
    autoFormat: true,
    inputOptions: {
        showDialCode: true,
        placeholder: 'Enter phone number',
        styleClasses: 'w-full py-3 px-4 border border-gray-200 rounded-md bg-white text-sm focus:border-blue-600 focus:ring-0'
    },
    dropdownOptions: {
        showFlags: true,
        showSearchBox: true,
        showDialCodeInList: true,
        showDialCodeInSelection: true,
        classNames: 'py-3 px-4 border border-gray-200 rounded-l-md bg-white text-sm'
    }
});
app.mount('#app')
