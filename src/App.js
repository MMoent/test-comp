import React,{Component} from 'react';
import MainBox from './mainBox';
import './App.css';


class App extends Component{
  constructor(){
    super();
    this.state = {
      charSelected: false,
      showTraj:0,
      bntLabel:'显示轨迹',
      speedChange:false,
      speed:101
    }
  }
  handleShowPath(){
    this.setState({showTraj:this.state.showTraj+1,bntLabel:this.state.charSelected?this.state.showTraj%2===0?'暂停':'继续':'显示轨迹',speedChange:false})
  }
  handleCharSelect(){
    this.setState({charSelected:!this.state.charSelected,showTraj:0, bntLabel:'显示轨迹',speedChange:false})
  }
  handleReset(){
    this.setState({showTraj:0,bntLabel:'重新显示',speedChange:false})
  }
  handleSpeedDown(){
    if(this.state.speed < 191) this.setState({speed:this.state.speed+10,speedChange:true})
  }
  handleSpeedUp(){
    if(this.state.speed > 1) this.setState({speed:this.state.speed-10,speedChange:true})
  }
  render(){
    return (
      <div className="App">
        <button onClick={this.handleCharSelect.bind(this)}>{"白居易"}</button>
        <button onClick={this.handleShowPath.bind(this)}>{this.state.bntLabel}</button>
        <button onClick={this.handleSpeedDown.bind(this)}>{'减速'}</button>
        <label>{'×'+((101-this.state.speed)/100+1).toFixed(1)}</label>
        <button onClick={this.handleSpeedUp.bind(this)}>{'加速'}</button>
        
        <MainBox showChar={this.state.charSelected} showTraj={this.state.showTraj} speed={this.state.speed} speedChange={this.state.speedChange} reset={this.handleReset.bind(this)}/>
        
      </div>
    );
  }
}

export default App;
