<template>
    <div id="mapid"></div>
</template>
<script>
import * as d3 from 'd3'
export default {
    name: 'Map',
    data(){
        return {
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
        },
        traj_data () {
            return this.$store.state.traj_data
        },
        dateTime () {
            return this.$store.state.dateTime
        },
        updatemap () {
            return this.$store.state.updatemap
        },
        funcbar () {
            return this.$store.state.funcbar
        }
    },
    watch: {
        dataprocesscomplete: {
            handler(val, oldVal) {
                if(val == 1){
                    
                }
            },
            deep: true
        },
        dateTime: {
            handler(val, oldVal){
                this.updateTime(val)
            }
        },
        updatemap: {
            handler(val, oldVal){
                this.drawmark(val)
            },
            deep: true
        },
        funcbar: {
            handler(val, oldVal){
                this.drawmark(val)
            },
            deep: true
        }
    },
    methods:{
        drawmark(val){
            let that = this,
                g = d3.select('#mappanel'),
                proj = this.$store.state.proj
            
            function getbezierPath(point1, point2){
                let p1 = proj([point1[0], point1[1]]),
                p2 = proj([point2[0], point2[1]]),
                deltay = p2[1] - p1[1],
                deltax = p2[0] - p1[0],
                angle = Math.atan2(deltay, deltax)
                var lat1, lng1;
                if(deltax > 0 && deltay > 0){
                    lat1 = p1[0] + deltax / 2
                    lng1 = p1[1] + deltay 
                } else if (deltax > 0 && deltay < 0){
                    lat1 = p1[0] + deltax 
                    lng1 = p1[1] + deltay / 2
                } else if (deltax < 0 && deltay < 0){
                    lat1 = p1[0] + deltax / 2
                    lng1 = p1[1] + deltay
                } else if (deltax < 0 && deltay > 0){
                    lat1 = p1[0] + deltax
                    lng1 = p1[1] + deltay / 2
                } else if (deltax = 0){
                    lat1 = p1[0]
                    lng1 = p1[1] + deltay / 2
                } else if (deltay = 0){
                    lat1 = p1[0] + deltax / 2
                    lng1 = p1[1]
                } else {
                    lat1 = deltax
                    lng1 = deltay
                }
                return "M" + p1[0] + ',' + p1[1] + "Q" + lat1 + "," + lng1 + " " + p2[0] + "," + p2[1]
            }
            
            function trajectorylinemouseover(d,i){
                let ind = d3.select(this).attr('index'),
                tex = '',
                x = d3.event.x,
                y = d3.event.y
                
                that.traj_data.forEach((v,j) => {
                    if(ind == v['轨迹号']){
                        //console.log(v)
                        //tex = v['序号'] + '患者于' + v['事件时间'] + '从' + v['输出地'] + '到' + v['输入地'] + ' - ' + v['事件类型']
                        tex =  v['输出地'] + '到' + v['输入地']
                    }
                })
                
                d3.select('#mappanel')
                    .append('text')
                    .text(tex)
                    .attr('class', "trajectorytext")
                    .attr('transform', () => {
                        return 'translate('+ (x-100) +',' + (y-100) + ')'
                    })
                    .style('font-size', '12px')
            }
            function trajectorylinemouseout(d,i){
                d3.selectAll('.trajectorytext').remove()
            }
            
            function trajectorycirclemouseover(d,i){
                let ind = d3.select(this).attr('index'),
                    st = d3.select(this).attr('st'),
                    tex = '',
                    pos = []
                that.traj_data.forEach((v,j)=>{
                    if(v['轨迹号'] == ind){
                        if(st == 0){
                            tex = v['输出地']
                            pos = proj([v['输出地维度'], v['输出地经度']])
                        } else {
                            tex = v['输入地']
                            pos = proj([v['输入地维度'], v['输入地经度']])
                        }
                    }
                })
                
                d3.select('#mappanel')
                    .append('text')
                    .text(tex)
                    .attr('class', "trajectorytext")
                    .attr('transform', () => {
                        return 'translate('+ pos[0] +',' + pos[1] + ')'
                    })
                    .style('font-size', '12px')
            }
            
            function trajectorycirclemouseout(d,i){
                d3.selectAll('.trajectorytext').remove()
            }
            
            console.log(val.info)

            if(val.info == 'UPDATE_UPDATEMAP'){
                //清空	
                d3.selectAll('.disselect-trajectory').remove()
                d3.selectAll('.select-trajectory').remove()
                d3.selectAll('.positioncircle').remove()

                that.traj_data.forEach((d,i) => {
                    let start_lat = +d['输出地经度'],
                    start_lng = +d['输出地维度'],
                    end_lat = +d['输入地经度'],
                    end_lng = +d['输入地维度']
                    
                    if(start_lat != '0' && end_lat != '0' && start_lat != end_lat){
                        let trajectorypath = getbezierPath([start_lng, start_lat], [end_lng, end_lat])
                        let path = g.append('path')
                            .attr('d', trajectorypath)
                            .attr('class', () => {return 'disselect-trajectory ' + d['轨迹号']})
                            .attr('index', d['轨迹号'])
                            .attr('person', d['序号'])
                            .style('opacity', 1)
                            .on('mouseover', trajectorylinemouseover)
                            .on('mouseout', trajectorylinemouseout)

                        let totalLength = path.node().getTotalLength();

                        if(val.features.init == 1){
                            path
                            .attr("stroke-dasharray", totalLength + " " + totalLength)
                            .attr("stroke-dashoffset", totalLength)
                            .transition().duration(4000).ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                        } 

                    }
                    if(start_lng != 0 && start_lat != 0){
                        
                        let start_point = proj([start_lng, start_lat])
                        g.append('circle')
                            .attr('cx', start_point[0])
                            .attr('cy', start_point[1])
                            .attr('r', 4)
                            .attr('class', 'positioncircle')
                            .attr('index', d['轨迹号'])
                            .attr('person', d['序号'])
                            .style('fill', that.colors(d['事件类型']))
                            .style('opacity', 1)
                            
                        g.append('circle')
                            .attr('cx', start_point[0])
                            .attr('cy', start_point[1])
                            .attr('r', 2)
                            .attr('class', 'positioncircle')
                            .attr('index', d['轨迹号'])
                            .attr('person', d['序号'])
                            .attr('st', 0) //source target
                            .style('fill', 'white')
                            .style('opacity', 1)
                            .on('mouseover', trajectorycirclemouseover)
                            .on('mouseout', trajectorycirclemouseout)
                    }
                    
                    if(end_lng != 0 && end_lng != 0){
                        let end_point = proj([end_lng, end_lat])
                        g.append('circle')
                            .attr('cx', end_point[0])
                            .attr('cy', end_point[1])
                            .attr('r', 4)
                            .attr('class', 'positioncircle')
                            .attr('index', d['轨迹号'])
                            .attr('person', d['序号'])
                            .style('fill', that.colors(d['事件类型']))
                            .style('opacity', 1)
                            
                            
                        g.append('circle')
                            .attr('cx', end_point[0])
                            .attr('cy', end_point[1])
                            .attr('r', 2)
                            .attr('class', 'positioncircle')
                            .attr('index', d['轨迹号'])
                            .attr('person', d['序号'])
                            .attr('st', 1) //source target
                            .style('fill', 'white')
                            .style('opacity', 1)
                            .on('mouseover', trajectorycirclemouseover)
                            .on('mouseout', trajectorycirclemouseout)
                    }
                })
            }

            if(val.info == 'play_singletrack'){
                function sleepfunc(delay) {
                    var start = (new Date()).getTime();
                    while((new Date()).getTime() - start < delay) {
                        continue;
                    }
                }

                console.log(that.traj_data)
                //清空	
                d3.selectAll('.disselect-trajectory').remove()
                d3.selectAll('.select-trajectory').remove()
                d3.selectAll('.positioncircle').remove()

                //暂不考虑数据时间顺序
                let track = []
                that.traj_data.forEach((d,i) => {
                    if(d['确诊患者'] == val.features){
                        track.push(d)
                    }
                })

                for(let i=0; i<track.length; i++){
                    (function(i) {
                        setTimeout(function() {
                            let d = track[i]
                            let start_lat = +d['输出地经度'],
                                start_lng = +d['输出地维度'],
                                end_lat = +d['输入地经度'],
                                end_lng = +d['输入地维度']
                            if(start_lat != '0' && end_lat != '0' && start_lat != end_lat){
                                let trajectorypath = getbezierPath([start_lng, start_lat], [end_lng, end_lat])
                                let path = g.append('path')
                                    .attr('d', trajectorypath)
                                    .attr('class', () => {return 'disselect-trajectory ' + d['轨迹号']})
                                    .attr('index', d['轨迹号'])
                                    .attr('person', d['序号'])
                                    .style('opacity', 1)
                                    .on('mouseover', trajectorylinemouseover)
                                    .on('mouseout', trajectorylinemouseout)

                                let totalLength = path.node().getTotalLength();

                                path
                                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                                    .attr("stroke-dashoffset", totalLength)
                                    .transition().duration(1000).ease(d3.easeLinear)
                                    .attr("stroke-dashoffset", 0)

                            }
                            if(start_lng != 0 && start_lat != 0){
                                
                                let start_point = proj([start_lng, start_lat])
                                g.append('circle')
                                    .attr('cx', start_point[0])
                                    .attr('cy', start_point[1])
                                    .attr('r', 4)
                                    .attr('class', 'positioncircle')
                                    .attr('index', d['轨迹号'])
                                    .attr('person', d['序号'])
                                    .style('fill', that.colors(d['事件类型']))
                                    .style('opacity', 1)
                                    
                                g.append('circle')
                                    .attr('cx', start_point[0])
                                    .attr('cy', start_point[1])
                                    .attr('r', 2)
                                    .attr('class', 'positioncircle')
                                    .attr('index', d['轨迹号'])
                                    .attr('person', d['序号'])
                                    .attr('st', 0) //source target
                                    .style('fill', 'white')
                                    .style('opacity', 1)
                                    .on('mouseover', trajectorycirclemouseover)
                                    .on('mouseout', trajectorycirclemouseout)
                            }
                            
                            if(end_lng != 0 && end_lng != 0){
                                let end_point = proj([end_lng, end_lat])
                                g.append('circle')
                                    .attr('cx', end_point[0])
                                    .attr('cy', end_point[1])
                                    .attr('r', 4)
                                    .attr('class', 'positioncircle')
                                    .attr('index', d['轨迹号'])
                                    .attr('person', d['序号'])
                                    .style('fill', that.colors(d['事件类型']))
                                    .style('opacity', 1)
                                    
                                    
                                g.append('circle')
                                    .attr('cx', end_point[0])
                                    .attr('cy', end_point[1])
                                    .attr('r', 2)
                                    .attr('class', 'positioncircle')
                                    .attr('index', d['轨迹号'])
                                    .attr('person', d['序号'])
                                    .attr('st', 1) //source target
                                    .style('fill', 'white')
                                    .style('opacity', 1)
                                    .on('mouseover', trajectorycirclemouseover)
                                    .on('mouseout', trajectorycirclemouseout)
                            }
                            
                        }, (i + 1) * 1000);
                    })(i)
                }
                
            }

        },
        updateTime(time){
            d3.selectAll('.timelabel').remove()
            
            d3.select('#mapid').select('svg')
                .append('text')
                .text(time)
                .style('font-size', '15px')
                .attr('class', 'timelabel')
                .attr('x', 20)
                .attr('y', 30)
        },
        testTimelabel(config){
            //{'starttime': 2019/12/26 8:00 , 'endtime': 2020/2/6 1:00}
            d3.selectAll('.testTimelabel').remove()

            d3.select('#mapid').select('svg')
                .append('text')
                .text(time)
                .style('font-size', '15px')
                .attr('class', 'testTimelabel')
                .attr('x', 20)
                .attr('y', 30)
        }
    },
    mounted(){
        let that = this
        let supply_range=[{"name":"0.5%-2.5%","id":0},
                    {"name":"2.5%-5%","id":1},
                    {"name":"5%-7.5%","id":2},
                    {"name":"7.5%-10%","id":3}]
        var move_links;
        var width = document.getElementById('mapid').offsetWidth;
        var height = document.getElementById('mapid').offsetHeight;
        var color = d3.scaleLinear()
            .domain([0, 3])
            .range(["rgb(161,191,207)","rgb(0,94,158)" ])
            .interpolate(d3.interpolateHcl);

        var bascolor=["rgb(238,238,238)","rgb(111,213,201)","rgb(255,176,93)","rgb(255,119,105)","rgb(165,200,233)","rgb(244,172,88)"];
        var svg = d3.select("#mapid").append("svg")
            .attr("width", width)
            .attr("height", height);
    
        var tooltip = d3.select("#tooltip");
    
        var proj = d3.geoMercator()
                            .center([114.25445487896184, 22.72601655078104])
                            //.center([100, 38]) ,
                            .scale(1000)
                            .translate([width/2, height/2]);

        var path = d3.geoPath().projection(proj);

        that.$store.commit('UPDATE_PROJ', proj)

        var tooltip = d3.select("#tooltip");
        let min_square=20
        let zoom_scale=1
        let min_zoom=10

        this.colors = d3.scaleOrdinal(d3.schemeCategory10)

        var g = svg.append("g")
                .attr('id', 'mappanel')
                .on("wheel.zoom",function(){
                    var currScale = proj.scale();
                    var newScale = currScale - 10*event.deltaY;
                    if(newScale<0) newScale=currScale*0.6

                    if(newScale > 1000){
                        proj.scale(newScale);
                        zoom_scale=zoom_scale*newScale/currScale
                        var currTranslate = proj.translate();
                        var coords = proj.invert([event.offsetX, event.offsetY]);
                        
                        var newPos = proj(coords);

                        proj.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
                        //g.selectAll("path").attr("d", path);
                        g.selectAll(".map").attr("d", path);
                        
                        that.$store.commit('UPDATE_dateTime', "2019/12/26 8:00 - 2020/2/6 1:00")
                        
                        //that.drawmark()
                        that.$store.commit('UPDATE_UPDATEMAP', {'info': 'UPDATE_UPDATEMAP','features': {'init': 0}})

                        g.selectAll(".province_text")
                                .attr("x", function (d) {
                                    let local=proj(d.properties.cp);
                                    return local[0]
                                })
                                .attr("y", function (d) {
                                    let local=proj(d.properties.cp);
                                    return local[1];
                                })
                    }                    
                })
                .call(d3.drag().on("drag", function(){
                    var currTranslate = proj.translate();
                    proj.translate([currTranslate[0] + d3.event.dx,
                                        currTranslate[1] + d3.event.dy]);
                    //g.selectAll("path").attr("d", path);
                    g.selectAll(".map").attr("d", path);
                    that.$store.commit('UPDATE_dateTime', "2019/12/26 8:00 - 2020/2/6 1:00")
                    
                    //that.drawmark()
                    that.$store.commit('UPDATE_UPDATEMAP', {'info': 'UPDATE_UPDATEMAP','features': {'init': 0}})
                    g.selectAll(".province_text")
                            .attr("x", function (d) {
                                let local=proj(d.properties.cp);
                                return local[0]
                            })
                            .attr("y", function (d) {
                                let local=proj(d.properties.cp);
                                    return local[1];
                            })
                }));
        
        
        d3.json("geometryWorld/world.geo.json").then((cn) => {
            // Define the div for the tooltip
            var div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);
            var countries=g.selectAll(".countries")
                    .data(cn.features)
                    .enter()
                    .append("path")
                    .attr("class","zones countries map")
                    .on("mouseover", function (d) {

                    })
                    .on("mouseout", function (d) {
                        
                    })
                    .style("fill",function(d,i){
                        return                    
                    })
                    .style("stroke",function(d){
                        return "rgba(250,250,250,0.7)"
                    })
                    .style("stroke-width","1px")
                    .attr("d", path);
                })
        d3.json("geometryWorld/china.json").then((cn) => {
            // Define the div for the tooltip
            
            var city=g.selectAll(".provinces")
                    .data(cn.features)
                    .enter()
                    .append("path")
                    .attr("class","zones provinces map")
                    .on("mouseover", function (d) {
                        
                    })
                    .on("mouseout", function (d) {
                        
                    })
                    .style("fill",function(d,i){
                        return                    
                    })
                    .style("stroke","rgba(200,200,200,1)")
                    .style("stroke-width","1px")
                    .attr("d", path);
                    
            var cityTitle = g.selectAll(".provincesTitle")
                    .data(cn.features)
                    .enter()
                    .append('text')
                    .attr("class","province_text")
                    .text((d,i) => {
                        return d.properties.name
                    })
                    .attr('x', (d,i)=>{
                        let pos = proj(d.properties.cp)
                        return pos[0]
                    })
                    .attr('y', (d,i)=>{
                        let pos = proj(d.properties.cp)
                        return pos[1]
                    })
                    .style('font-size', (d,i) => {
                        return 12
                    })
                    .style('stroke', 'grey')
                    
                var rect_scale=100

                for(var i=0;i<cn.features.length;i++){
                    let file_name=cn.features[i].properties.id
                    d3.json("geometryProvince/"+file_name+".json", function (error, t_cn) {
                        g.selectAll(".cities_"+i)
                            .data(t_cn.features)
                            .enter()
                            .append("path")
                            .attr("d", path)
                            .attr('class', 'map')
                            .attr("id","cities_"+i)
                            .attr("fill",function(d){
                                return "none"             
                            })
                            .attr("stroke","rgba(200,200,200,0.6)")
                            .style("stroke-width","0.5px")
                        })
                }
                //that.drawmark(g, proj)
                setTimeout(function(){
                    that.$store.commit('UPDATE_UPDATEMAP', {'info': 'UPDATE_UPDATEMAP','features': {'init': 1}})
                    //that.drawmark()
                    }, 100)
                
                that.$store.commit('UPDATE_dateTime', "2019/12/26 8:00 - 2020/2/6 1:00")
        });
        let starttime = new Date('2019/12/26 8:00'),
            endtime = new Date('2020/2/6 1:00')
        //testTimelabel({'starttime': starttime, 'endtime': endtime})
    }
}
</script>
<style>
	#mapid { 
		height: 80%; 
		width: 90%;
		position:relative;
		float:left;
		margin: 0.5% 0.5%;
	}
    .zones {
        fill: rgb(241,241,241);
        stroke: white;
        stroke-width: .6px;
    }
    .links{
        fill:none;
        stroke:rgb(150,150,150);
    }
   	.title_text{
        font-size: 30pt;
        fill: #ffffff;
        fill-opacity: .4;
    }
    .province_text{
        fill:rgb(104,104,104);
    }
   	.remark{
        font-family: serif;
        font-size: 20px;
        font-weight: bold;
        fill-opacity:0.9;
    }
    div.tooltip {
	    position: absolute;         
	    text-align: center;         
	    width: 200px;                    
	    height: 50px;
	    padding: 2px;               
	    font: 12px sans-serif;      
	    background: rgb(220,220,220); 
	    border: 0px;              
	    pointer-events: none;
	    font-weight:bold;
	    color:rgb(100,100,100);
    }
    .disselect-trajectory{
    	fill: none;
    	stroke: grey;
    	stroke-width: 2px;
    }
    .select-trajectory{
    	fill: none;
    	stroke: orange;
    	stroke-width: 2px;
    }
</style>
