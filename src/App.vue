<template>
  
  <div id="app">
    <PreData></PreData>
    <PageHeader></PageHeader>
    <div class="box">
      <Map></Map>
      <FuncBar></FuncBar>
    </div>
  </div>
</template>

<script>
  import PageHeader from './components/PageHeader'
  import EventLine from './components/EventLine'
  import Map from './components/Map'
  import PreData from './components/PreData'
  import FuncBar from './components/FuncBar'
export default {
  name: 'App',
  components: {
    PageHeader,
    EventLine,
    Map,
    PreData,
    FuncBar
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  height: 1080px;
  width: 1920px;
}
body{
      background:white;
      margin: 0px;
  }
.box{
  width:100%;
  height:85%;
}
</style>
