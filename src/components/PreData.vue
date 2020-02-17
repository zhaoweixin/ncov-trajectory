<template>
</template>
<script>
import * as d3 from 'd3'

export default {
    name: 'PreData',
    data() {
        return {
            datapath: 'src/assets/haerbin18trajectory3.csv',
            event_type: [],
            timerange: [],
            traj_dict: {},
            person_dict: {},
            parseTime: null
        }
    },
    mounted(){
        //init data
        let that = this
        //const csv = require('@/assets/haerbin18trajectory3.csv')
        //console.log(csv)
        d3.csv('fake.csv').then((traj_data) => {
            that.event_type = Array.from(new Set(traj_data.map((d) => {return d['事件类型']})))
            that.trajectory_index = Array.from(new Set(traj_data.map((d) => {return d['序号']})))
            that.parseTime = d3.timeParse("%Y/%m/%d %H:%M")
            that.timerange = Array.from(new Set(traj_data.map((d) => { return d['事件时间']}))).sort()
            that.timerange = that.timerange.map((d,i) => {return that.parseTime(d)})

            traj_data.forEach((d,i) => {
                if(d['序号'] in that.person_dict){
                    that.person_dict[d['序号']].push(d)
                }else{
                    that.person_dict[d['序号']] = []
                    that.person_dict[d['序号']].push(d)
                }
                that.traj_dict[d['轨迹号']] = d
            })

            that.$store.commit('UPDATE_traj_data', traj_data)
            that.$store.commit('UPDATE_event_type', that.event_type)
            that.$store.commit('UPDATE_timerange', that.timerange)
            that.$store.commit('UPDATE_traj_dict', that.traj_dict)
            that.$store.commit('UPDATE_person_dict', that.person_dict)
            that.$store.commit('UPDATE_dataprocesscomplete', 1)
            console.log('previous data process complete')
        })
    }
}
</script>
<style>

</style>
