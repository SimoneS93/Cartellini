<template>
	<tr :class="klass" @click="$emit('click', year, month, date)">
		<td v-text="dayString"></td>
		<template v-for="access in accesses">
			<td v-text="time(access.start)"></td>
			<td v-text="time(access.end)"></td>
		</template>
		<td v-text="dueHours"></td>
		<td v-text="workedHours"></td>
		<td v-text="missedHours"></td>
		<td v-text="extraHours"></td>
	</tr>
</template>

<script>
const moment = require('moment')

require('moment-duration-format')

export default {
    props: ['year', 'month', 'date', 'timestamps', 'dayHours'],

    computed: {
        /**
         * Sorted timestamps
         *
         * @returns {Array|any[]}
         * @private
         */
        _timestamps() {
            let timestamps = (this.timestamps || []).map(x => x)

            timestamps.sort((a, b) => a.date_of > b.date_of)

            return timestamps
		},

        klass() {
            if (!this.isWorkingDay)
                return 'valid'

            return this.accesses.filter(access => access.start && !access.end).length ? 'invalid' : 'valid'
        },

        dayOfWeek() {
            return new Date(this.year, this.month, this.date).getDay()
        },

        isWorkingDay() {
            return this.dayOfWeek != 0 && this.dayOfWeek != 6
        },

        dayString() {
            return this.pad(this.date) + ' ' + ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][this.dayOfWeek]
        },

        accesses() {
            return (this._timestamps ? this._timestamps : []).reduce((accesses, timestamp, i) => {
                const isStart = i % 2 == 0
                const index = Math.floor(i / 2)
                const date = new Date(timestamp.date_of)

                if (isStart)
                    accesses.push({ start: date })
                else
                    accesses[index].end = date

                return accesses
            }, [])
            .concat([ { start: null, end: null }, { start: null, end: null }, { start: null, end: null }])
            .slice(0, 3)
        },

        dueMillis() {
            return this.isWorkingDay ? 1000 * 3600 * parseFloat(this.dayHours) : 0
        },

        dueHours() {
            return this.duration(this.dueMillis)
        },

        workedMillis() {
            return this.accesses
                .filter(access => access.start && access.end)
                .reduce(
                    (total, access) => total + (access.end - access.start), 0
                )
        },

        workedHours() {
            return this.duration(this.workedMillis, true)
        },

        missedMillis() {
            return Math.max(0, this.dueMillis - this.workedMillis)
        },

        missedHours() {
            return this.duration(this.missedMillis)
        },

        extraMillis() {
            return Math.max(0, this.workedMillis - this.dueMillis)
        },

        extraHours() {
            return this.duration(this.extraMillis)
        }
    },

    methods: {
        time(ts) {
            if (!ts)
                return ''

            return moment(ts).format('HH:mm')
        },

        duration(millis) {
            if (millis < 0)
                return '00:00'

            const seconds = Math.round(millis / 1000)
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds - 3600 * hours) / 60)

            return `${this.pad(hours)}:${this.pad(minutes)}`
        },

        pad(n) {
            return n >= 10 ? `${n}` : `0${n}`
        }
    }
}
</script>

<style>
    tr.invalid {
        background: antiquewhite;
    }
</style>