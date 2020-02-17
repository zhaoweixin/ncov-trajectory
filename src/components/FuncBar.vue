<template>
    <div>
        <div id="funcbar" style="width: 200px; height: 200px">
            
        </div>
    </div>
</template>
<script>
import * as d3 from 'd3'
export default {
    name: 'FuncBar',
    data () {
        return {}
    },
    mounted () {
        let that = this
        let svg = d3.select('#funcbar')
            .attr('width', '200px')
            .attr('height', '200px')
        
        svg.append('text')
            .text('person1')
            .attr('transform', 'translate(20px, 10px)')
            .on('click', function(){
                that.$store.commit('UPDATE_FUNCBAR', {"info": 'play_singletrack', 'features': '1'})
            })
        
        svg.append('text')
            .text('person2')
            .attr('transform', 'translate(20px, 40px)')
            .on('click', function(){
                that.$store.commit('UPDATE_FUNCBAR', {"info": 'play_singletrack', 'features': '2'})
            })

        svg.append('text')
            .text('reset_trajectory')
            .attr('transform', 'translate(20px, 80px)')
            .on('click', function(){
                that.$store.commit('UPDATE_UPDATEMAP', {'info': 'UPDATE_UPDATEMAP','features': {'init': 1}})
            })
    }
    
}
</script>
<style>

</style>
