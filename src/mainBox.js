import React, { Component } from 'react'
import EsriLoader from 'esri-loader'

class MainBox extends Component{
  constructor(){
    super()
    this.dojoUrl = "http://tony-space.top:8007/arcgis_js_api/library/4.11/dojo/dojo.js"
    this.tileMapUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    this.baseFeatureUrl = "http://172.20.32.70:6080/arcgis/rest/services/TD/MapServer/"
    this.charHighlight = []
  }
  componentWillMount(){
    this.initMap()
  }
  
  componentDidUpdate(){
    this.charLayer.visible = this.props.showChar
    if(this.props.showChar){
      if(this.props.showTraj===0){
        console.log('loading...')
        this.polyline.paths = []
        this.loadingPath()
      }else if(this.props.showTraj%2!==0){
        console.log('showing trajectory...')
        if(this.props.speedChange){
          if(this.t) {
            clearInterval(this.t)
            this.t = null
          }
        }
        if(this.traj && this.traj.length>0) {
          this.play()
        }
      }else{
        console.log('pausing...')
        if(this.t) {
          clearInterval(this.t)
          this.t = null
        }
      }
    }else{
      console.log('teminating...')
      if(this.t) {
        clearInterval(this.t)
        this.t = null
      }
      this.graphic.geometry = undefined
      this.polyline.paths = []
      while(this.charHighlight.length) this.charHighlight.shift().remove()
    }
  }
  play(){
    //this.view.goTo({center:this.traj[0],zoom:6},{duration:500,easing:'in-out-expo'})
    this.t = setInterval(() => {
        //console.log(this.charHighlight)
        if(this.traj.length>0) {
          let tmp =  this.traj.shift()
          //this.view.goTo({center:tmp,zoom:6},{duration:1000,easing:'in-out-expo'})
          this.polyline.paths.push(tmp)
          this.graphic.geometry = this.polyline
          let highlightIdx = this.nodeIdx.shift()
          if(this.polyline.paths.length===highlightIdx){
            if(this.charHighlight.length)this.charHighlight.shift().remove()
            this.view.whenLayerView(this.charLayer).then((layerView)=>{
            let query = this.charLayer.createQuery();
            this.charLayer.queryFeatures(query).then((result)=>{
            this.charHighlight.push(layerView.highlight(result.features.length-this.nodeIdx.length-1));
            if(!this.traj.length){
              setTimeout(()=>{
                while(this.charHighlight.length) this.charHighlight.shift().remove()
              },800)
            }
            //
            })
          });
        }else{
          this.nodeIdx.unshift(highlightIdx)
        } 
        }else{
          clearInterval(this.t)
          if(this.props.reset) this.props.reset()
        }
    }, this.props.speed);
  }
  loadingPath(){
    this.view.whenLayerView(this.charLayer).then(()=>{
      let queryChar = this.charLayer.createQuery();
      this.charLayer.queryFeatures(queryChar).then((result)=>{
        let feature = result.features
        this.traj = []
        this.cnt = 0
        this.nodeIdx = [1]
        for(let i=0;i<feature.length-1;i++){
          this.traj.push.apply(this.traj,this.interpolation(feature[i].geometry,feature[i+1].geometry,i%2===0?1:-1))
          this.nodeIdx.push(this.cnt)
        }
      })
    })
  }
  interpolation(pointA, pointB,inverse){
    //calculate center
    let angle =(Math.PI/6 + Math.round(Math.random())/5)
    let pointC  = {x:0,y:0}
    if(pointA.x===pointB.x){
      pointC.x = pointA.x+Math.abs(pointB.y-pointA.y)/2*Math.tan(angle)
      pointC.y = pointA.y
    }else{
      let k = -(pointB.x-pointA.x)/(pointB.y-pointA.y)
      let x0 = (pointA.x+pointB.x)/2
      let y0 = (pointA.y+pointB.y)/2
      let dist = inverse*Math.sqrt((pointA.x-pointB.x)*(pointA.x-pointB.x)+(pointA.y-pointB.y)*(pointA.y-pointB.y))/2*Math.tan(angle)
      pointC.x = x0+dist*Math.sqrt(1/(1+k*k))
      pointC.y = y0+dist*Math.sqrt(1/(1+k*k))*k
    }
    let t = 0
    let incre = 0.1/Math.sqrt((pointA.x-pointB.x)*(pointA.x-pointB.x)+(pointA.y-pointB.y)*(pointA.y-pointB.y))
    let pnt ={x:0,y:0}, tmpPnt1 = {x:0,y:0} , tmpPnt2 = {x:0,y:0}
    let pntSet = []
    while(t<=1){
      tmpPnt1.x = (1-t)*pointA.x+t*pointC.x
      tmpPnt1.y = (1-t)*pointA.y+t*pointC.y
      tmpPnt2.x = (1-t)*pointC.x+t*pointB.x
      tmpPnt2.y = (1-t)*pointC.y+t*pointB.y
      pnt.x = (1-t)*tmpPnt1.x+t*tmpPnt2.x
      pnt.y = (1-t)*tmpPnt1.y+t*tmpPnt2.y
      pntSet.push([pnt.x,pnt.y])
      this.cnt++
      t+=incre
    }
    pntSet.push([pointB.x,pointB.y])
    this.cnt++
    return pntSet
  }
  
  initMap(){
    EsriLoader.loadModules([
      "esri/Map",
      "esri/Basemap",
      "esri/layers/TileLayer",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      'esri/Graphic',
      "dojo/domReady"
    ],this.dojoUrl).then(([Map,Basemap,TileLayer,MapView,FeatureLayer,Graphic])=>{
      let tileLayer = new TileLayer({
        url: this.tileMapUrl
      });
      let baseMap = new Basemap({
        baseLayers: [tileLayer],
        id: 'myBaseMap'
      });
      this.charLayer = new FeatureLayer({
        url:"http://172.20.32.70:6080/arcgis/rest/services/TD/MapServer/14",
        definitionExpression:'ID=0',
        visible: false
      });
      this.graphic = new Graphic();
      this.map = new Map({
        basemap: baseMap,
        layers: this.charLayer,
        
      });
      this.view = new MapView({
        center: [115, 32.1],
        map: this.map,
        container: "mapDiv",
        zoom: 5
      });
      this.graphic.symbol = {
        type: "simple-line",
        color: [226, 119, 40],
        width: 1.5
      };
      this.view.graphics.add(this.graphic)
      this.polyline = {
        type:'polyline',
        paths:[]
      }
      
    })
  }

  render(){
    return(
      <div id='mapDiv' style={{height:'800px',width:'1500px'}}></div>
    )
  }
}

export default MainBox