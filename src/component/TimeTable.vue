<template>
    <div id="time-table">
        <h4>IMPIEGATO:
            <a :href="`/employees/${e.id}`" v-text="e.name"></a>
        </h4>
        <h5>PERIODO DI RIFERIMENTO:
            <span v-text="month"></span>/<span v-text="year"></span>
        </h5>

        <div id="accesses">
            <table class="bordered">
                <thead>
                <tr>
                    <th>Giorno</th>
                    <th>E</th>
                    <th>U</th>
                    <th>E</th>
                    <th>U</th>
                    <th>E</th>
                    <th>U</th>
                    <th>Dovute</th>
                    <th>Lavorate</th>
                    <th>Ass.</th>
                    <th>Str.</th>
                </tr>
                </thead>
                <tbody id="access-table">
                <tr is="working-day-row" v-for="day in days"
                        :year="year"
                        :month="month"
                        :date="day + 1"
                        :timestamps="indexedTimestamps[day+1]"
                        day-hours="8"
                        @click="edit"
                ></tr>
                </tbody>
            </table>
        </div>

        <br />

        <div id="summary">
            <table class="right">
                <tr>
                    <td>Ore dovute</td>
                    <td v-text="dueHours"></td>
                </tr>
                <tr>
                    <td>Ore lavorate</td>
                    <td v-text="workedHours"></td>
                </tr>
                <tr>
                    <td>Ore di assenza</td>
                    <td v-text="missedHours"></td>
                </tr>
                <tr>
                    <td>Ore di straordinario</td>
                    <td v-text="extraHours"></td>
                </tr>
            </table>
        </div>

        <div id="timestamp-form" class="overlay" v-show="editMode">
            <div class="form">
                <label for="time" v-text="editingLabel"></label>
                <br />
                <input type="text" name="time" v-model="time" placeholder="HH:mm" />
                <button class="success" @click="submit">AGGIUNGI</button>
                <button class="danger" @click="cancel">CHIUDI</button>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment'
    import axios from 'axios'

    moment.locale('it')

    export default {
        props: ['employee', 'timestamps', 'month', 'year'],

        data() {
            return {
                editMode: false,
                time: '',
                editingDay: ''
            }
        },

        asyncComputed: {
            dueHours() {
                return this.delay(
                    () => this.duration(this.sum('dueMillis'))
                )
            },

            workedHours() {
                return this.delay(
                    () => this.duration(this.sum('workedMillis'))
                )
            },

            missedHours() {
                return this.delay(
                    () => this.duration(this.sum('dueMillis') - this.sum('workedMillis'))
                )
            },

            extraHours() {
                return this.delay(
                    () => this.duration(this.sum('workedMillis') - this.sum('dueMillis'))
                )
            },
        },

        computed: {
            e() {
                return JSON.parse(this.employee.replace(/&quot;/g, '"'))
            },

            indexedTimestamps() {
                return this.groupBy(
                    JSON.parse(this.timestamps.replace(/&quot;/g, '"')),
                    ts => (new Date(ts.date_of)).getDate()
                )
            },

            days() {
                const daysInMonth = moment().date(1).month(this.month).year(this.year).daysInMonth()

                return Array.apply(null, Array(daysInMonth)).map((_, i) => i);
            },

            editingLabel() {
                if (!this.editingDay)
                    return ''

                return `Aggiungi timbraruta per il ${this.editingDay.format('l')}`
            }
        },

        methods: {
            delay(fn, delay = 1000) {
                return new Promise(resolve => {
                    setTimeout(() => resolve(fn()), delay)
                })
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
            },

            sum(attribute) {
                return this.$children
                    .map(workingDay => workingDay[attribute])
                    .filter(x => x)
                    .reduce((total, x) => total + x, 0)
            },

            groupBy(iterable, groupByCallback) {
                return iterable.reduce((grouped, item) => {
                    const key = groupByCallback(item)

                    if (key in grouped)
                        grouped[key].push(item)
                    else
                        grouped[key] = [item]

                    return grouped
                }, {})
            },

            edit(year, month, day) {
                this.editMode = true
                this.timeError = ''
                this.editingDay = moment(new Date(year, parseInt(month) - 1, parseInt(day))).set('hour', 12)
            },

            cancel() {
                this.timeError = ''
                this.editMode = false
            },

            submit() {
                this.editingDay.set('hour', parseInt(this.time.split(':')[0]))
                this.editingDay.set('minute', parseInt(this.time.split(':')[1]))

                axios.post(`/timestamps`, {
                    employee: this.e.id,
                    device: "xxyyzz",
                    date_of: this.editingDay.format('YYYY-MM-DD HH:mm:00')
                })
                .then(() => window.location.reload())
                .catch((err) => this.timeError = err)
            }
        }
    }
</script>

<style>
    td, th {
        padding: 0.25em;
        width: 4em;
    }

    th + th,
    td + td {
        text-align: center;
    }

    td[colspan] {
        position: relative;
        height: 16px;
    }

    table.bordered {
        border-collapse: collapse;
        border: 1px solid;
    }

    table.bordered th,
    table.bordered td {
        border: 1px solid;
    }

    .success {
        background: #5cb85c;
    }

    .danger {
        background: #d9534f;
    }

    table.right td + td {
        text-align: right;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
    }

    .form {
        background: #fff;
        width: 60%;
        height: 200px;
        position: absolute;
        padding: 10px;
        left: 20%;
        top: 30%;
    }

    .form > * {
        display: block;
        margin: 5px;
    }

    .form button {
        border: 1px solid;
        border-collapse: collapse;
        color: #fff;
        padding: 10px;
        display: inline-block;
        float: right;
        border-radius: 5px;
    }

    .form input[type="text"] {
        height: 30px;
        padding: 3px;
        border-radius: 5px;
        width: 50%;
        border: 1px solid #ccc;
    }

    #summary table {
        width: 270px;
    }
</style>