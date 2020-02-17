<template>
    <div class="pageheader">
		<div class="headerbar">
			<p class="headerbarp1">地图可视化</p>
		</div>
		<div class="graphtitle">
			<p class="graphtitlep1"> 深圳新冠肺炎患者轨迹 </p>
		</div>
	</div>
</template>
<script>
export default {
    
}
</script>
<style>
    .pageheader{
		width: 100%;
	}

	.headerbar{
		width: 100%;
		height: 50px;
		overflow: hidden;
		background: #282828
	}

	.graphtitle{
		width: 100%;
		
	}

	.headerbarp1{
		margin: 0;
		transform: translate(40px, 10px);
		color: #B9B9B8;
		FONT-SIZE: x-large;
		vertical-align: middle;
	}

	.graphtitlep1{
		transform: translate(40px, 0);
		color: #C08F91;
		FONT-SIZE: x-large;
		width: 30%;
		font-weight: bold;
	}
	
</style>