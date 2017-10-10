<template>
    <div class="employee">
        <h3 v-text="e.name"></h3>

        <div @click="onSelect">
            <vue-monthly-picker
                :monthLabels="['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']"
            ></vue-monthly-picker>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['employee'],

        data() {
            return {
                month: 0
            }
        },

        computed: {
            e() {
                return JSON.parse(this.employee)
            },

            calendar() {
                return this.$children[0]
            }
        },

        methods: {
            onSelect(ev) {
                if ( !ev.target.classList.contains('item'))
                    return;

                window.location.href = `/employees/${this.e.id}/timetable/${this.calendar.year}/${this.calendar.month}`
            }
        }
    }
</script>

<style>
    .date-popover {
        display: block !important;
        min-width: 300px !important;
        width: 300px !important;
    }
</style>