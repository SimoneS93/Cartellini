'use strict'

import Vue from 'vue'
import VueMonthlyPicker from 'vue-monthly-picker'
import AsyncComputed from 'vue-async-computed'

import Employee from './component/Employee.vue'
import TimeTable from './component/TimeTable.vue'
import WorkingDayRow from './component/WorkingDayRow.vue'

Vue.use(AsyncComputed)
Vue.component('vue-monthly-picker', VueMonthlyPicker)
Vue.component('time-table', TimeTable)
Vue.component('working-day-row', WorkingDayRow)
Vue.component('employee', Employee)

// init app
new Vue({
    el: '#app'
})