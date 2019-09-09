import React, { Component } from 'react'
import EsriLoader from 'esri-loader'

class MainBox extends Component{
  constructor(){
    super()
    this.dojoUrl = "http://tony-space.top:8007/arcgis_js_api/library/4.11/dojo/dojo.js"
    this.tileMapUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    this.baseFeatureUrl = "http://172.20.32.70:6080/arcgis/rest/services/TD/MapServer/"
  }
  componentWillMount(){
    this.initMap()
  }
  componentDidUpdate(){
    if(this.props.showPath){
      this.showPath()
    }
  }
  showPath(){
    this.view.whenLayerView(this.charLayer).then((layerView)=>{
      let queryChar = this.charLayer.createQuery();
      this.charLayer.queryFeatures(queryChar).then((result)=>{
        let feature = result.features
        console.log(feature)
        this.view.goTo({
          center:[feature[0].geometry.x,feature[0].geometry.y],
          zoom: 6
        },{
          duration:1000,
          easing:'in-out-expo'
        })
        setTimeout(()=>{
          this.drawLine(feature,layerView)
        },1500)
      })
    })
  }
  drawLine(feature, layerView){
    console.log('drawing...')
    let traj = []
    for(let i=0;i<feature.length-1;i++){
      traj.push.apply(traj,this.interpolation(feature[i].geometry,feature[i+1].geometry,i%2===0?1:-1))
    }
    var lineSymbol = {
      type: "simple-line", // autocasts as SimpleLineSymbol()
      color: [226, 119, 40],
      width: 1.5
    };
    var polyline = {
      type:'polyline',
      paths:[]
    }
    this.view.graphics.add(this.graphic)
    this.graphic.symbol = lineSymbol
    let draw = ()=>{
      if(this.props.showPath && traj.length>0){
        this.t = setTimeout(()=>{
          let tmp = traj.shift()
          polyline.paths.push(tmp)
          this.view.goTo({center:[tmp[0]+3,tmp[1]],zoom:6},{duration:200,easing: 'in-out-expo'})
          this.graphic.geometry = polyline
          draw()
        },100)
      }else {
        clearTimeout(this.t)
      }
    }
    draw()
  }

  interpolation(pointA, pointB,inverse){
    //calculate center
    let angle =(Math.PI/6 + Math.round(Math.random())/5)
    console.log(angle)
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
      t+=incre
    }
    pntSet.push([pointB.x,pointB.y])
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
        definitionExpression:'ID=0'
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
    })
  }

  render(){
    return(
      <div id='mapDiv' style={{height:'800px',width:'1500px'}}></div>
    )
  }
}

export default MainBox