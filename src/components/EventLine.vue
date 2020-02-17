<template>
    <div id="eventline"></div>
</template>

<script>
import * as d3 from 'd3'
export default {
    name: 'EventLine',
    data(){
        return {
            containerid: 'eventline',
            container: null,
            width: null,
            height: null,
            margin: {top: null, right: null, bottom: null, left: null},
            title: null,
            line_container: null,
            eventlegend: null,
            eventline: null,
            eventyAxis: null,
            xScale: null,
            parseTime: null,
            colors: null
        }
    },
    components: {

    },
    computed:{
        timerange () {
            return this.$store.state.timerange
        },
        event_type () {
            return this.$store.state.event_type
        },
        dataprocesscomplete () {
            return this.$store.state.dataprocesscomplete
        },
        person_dict () {
            return this.$store.state.person_dict
        },
        traj_dict () {
            return this.$store.state.traj_dict
        }
    },
    watch: {
        dataprocesscomplete: {
            handler(val, oldVal) {
                if(val == 1){
                    this.drawLegend()
                    this.drawLine()
                }
            },
            deep: true
        }
    },
    methods:{
        drawLegend(){
            //draw legend
            let that = this
            
            this.xScale = d3.scaleTime().range([0, that.width]).domain(d3.extent(that.timerange))
            this.colors = d3.scaleOrdinal(d3.schemeCategory10)
            this.event_type.forEach((d,i) => {
                let row = Math.floor(i / 3),
                    col = i % 3,
                    row_gap = that.margin.top,
                    col_gap = that.width / 3
                
                that.eventlegend.append('circle')
                    .attr('cx', col * col_gap)
                    .attr('cy', row * row_gap)
                    .attr('r', 4)
                    .style('fill', that.colors(d))
                    //.on('mouseover', )
                
                that.eventlegend.append('circle')
                    .attr('cx', col * col_gap)
                    .attr('cy', row * row_gap)
                    .attr('r', 2)
                    .style('fill', 'white')
                
                that.eventlegend.append('text')
                    .text(d)
                    .style('font-size', '13px')
                    .attr('transform', () =>{
                        return 'translate('+ (col * col_gap + 9) + ','+  (row * row_gap + 5) +')'
                    })
                
            })
        },
        drawLine(){
            //draw line
            let that = this,
                position_ind = 1,
                ele = null, //单个人轨迹集合
                eventline_ele = null, // 单个人单个轨迹
                eventline_ele_list = []
                this.xScale = d3.scaleTime().range([0, that.width]).domain(d3.extent(that.timerange))

            for (let key in that.person_dict){
                eventline_ele = that.eventline.append('g')
                    .attr('transform', () =>{
                        return 'translate(0,' + 40 * position_ind + ')'
                    })
                //text
                eventline_ele.append('text')
                    .text(()=> {return '患者' + position_ind})
                    .attr('transform', () =>{
                        return 'translate('+ (-that.margin.left * 0.7) + ',3)'
                    })
                    .style('font-size', '13px')
                    .attr('person', key)
                    .on('click', function(){that.handler_click_eventlinetext(this)})
                
                //xAxis
                eventline_ele.append('g')
                    .attr('class', 'axis')
                    .call(d3.axisBottom(that.xScale)
                        .ticks(0)
                    .tickFormat(d3.timeFormat("%Y-%m-%d")))
                    .selectAll("text")	
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                
                for(let j=0; j<that.person_dict[key].length; j++){

                    ele = that.person_dict[key][j]
                    eventline_ele.append('circle')
                        .attr('cx', that.xScale(that.parseTime(ele['事件时间'])))
                        .attr('cy', 0)
                        .attr('r', 4)
                        .attr('index', ele['轨迹号'])
                        .attr('position_ind', position_ind)
                        .style('fill', that.colors(ele['事件类型']))
                        .on('click', function(){that.handle_click_eventline_circle(this)})
                    
                    eventline_ele.append('circle')
                        .attr('cx', that.xScale(that.parseTime(ele['事件时间'])))
                        .attr('cy', 0)
                        .attr('r', 2)
                        .attr('index', ele['轨迹号'])
                        .attr('position_ind', position_ind)
                        .style('fill', 'white')
                        .on('mouseover', function(){that.handle_over_eventline_circle(this)})
                        .on('mouseout', function(){that.handle_out_eventline_circle(this)})
                        .on('click', function(){that.handle_click_eventline_circle(this)})
                }
                
                eventline_ele_list.push(eventline_ele)
                position_ind += 1
            }

            //yAxis
            //抽样
            let yAxisList = [that.timerange[0], that.timerange[that.timerange.length-1]],
                yAxisLength = position_ind * 40
            
            for(let i=0; i<yAxisList.length; i++){
                let x1 = this.xScale(yAxisList[i]),
                    y1 = 30,
                    y2 = yAxisLength
                
                this.eventyAxis.append('line')
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x1)
                    .attr('y2', y2)
                    .style('stroke', 'grey')
                    .style("stroke-dasharray", ("3, 3"))
                
                this.eventyAxis.append('text')
                    .text(() => {
                        return yAxisList[i].getFullYear() + "/" + (yAxisList[i].getMonth()+1) + "/"  + yAxisList[i].getDate()
                    })
                    .attr('transform', 'translate(' + (x1 - 40) + ',' + y2 + ')')
                    .style('font-size', '13px')
            }
        },
        handler_click_eventlinetext(_this){
            //_this -> node
            //this -> vueComponent
            let that = this,
                person = d3.select(_this).attr('person'),
                time = ''
            
            this.updatemark({'info': 1, 'param': {'person': person}})

            time = this.person_dict[person][0]['事件时间'] + ' - ' + this.person_dict[person][this.person_dict[person].length-1]['事件时间']
            
            that.$store.commit('UPDATE_dateTime', time)
        },
        updatemark(mes){
            function handler(d,i){
                if(d3.select(this).attr('person') == mes.param.person){
                    return 1
                } else {
                    return 0
                }
            }
            d3.selectAll('.positioncircle').style('opacity', handler)
            d3.selectAll('.disselect-trajectory').style('opacity', handler)
        },
        handle_click_eventline_circle(_this){
            let index = d3.select(_this).attr('index')
            //
        },
        handle_over_eventline_circle(_this){
            //_this -> node
            //this -> vueComponent
            let that = this,
                index = d3.select(_this).attr('index'),
                position_ind = d3.select(_this).attr('position_ind')

            this.eventline.append('text')
                .attr('id', "t-" + index)
                .attr('transform', () => {
                    return 'translate('+ that.xScale(that.parseTime(that.traj_dict[index]['事件时间'])) +',' + (40 * (+position_ind) - 10) + ')'
                })
                .text(() => {return that.traj_dict[index]['事件类型'] + ' ' + that.traj_dict[index]['事件时间']})
                .style('font-size', '10px')
        },
        handle_out_eventline_circle(_this){
            let index = d3.select(_this).attr('index')
            d3.select("#t-" + index).remove();
        }
    },
    mounted(){
        let that = this
        this.container = d3.select('#' + that.containerid),
		this.width = document.getElementById('eventline').offsetWidth,
		this.height = document.getElementById('eventline').offsetHeight,
		this.margin = {
            top: this.height * 0.02, 
            right: this.width * 0.1, 
            bottom: this.height * 0.02, 
            left: this.width * 0.2
        }
		this.width = this.width - this.margin.left - this.margin.right
        this.height = this.height - this.margin.top - this.margin.bottom

        this.parseTime = d3.timeParse("%Y/%m/%d %H:%M");

        this.title = this.container.append('div')
            .style('text-align', 'center')
            .style('padding', '3% 1%')
        
        this.title.append('text')
                .text('患者事件时间线')

        this.line_container = this.container.append('svg')
            .attr('width', that.width + that.margin.left + that.margin.right)
            .attr('height', that.height + that.margin.top + that.margin.bottom)
        
        this.eventlegend = this.line_container
            .append('g')
            .attr('transform', () => { return 'translate(' + that.margin.left + ',' + that.margin.top / 2 + ')' })
        
        this.eventline = this.line_container
            .append('g')
            .attr('transform', () => { return 'translate(' + that.margin.left + ',' + that.margin.top + ')' })
        
	    this.eventyAxis = this.line_container
            .append('g')
            .attr('transform', () => { return 'translate(' + that.margin.left + ',' + that.margin.top + ')' })
    }
}
</script>
<style>
	#eventline {
		height: 98%;
		width: 18%;
		position:relative;
		float:left;
		margin: 0.5% 0.5%;
		}
    
</style>
