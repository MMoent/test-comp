import React,{Component} from 'react';
import MainBox from './mainBox';
import './App.css';


class App extends Component{
  constructor(){
    super();
    this.state = {
      isShowPath:false,
      bntLabel:'显示轨迹'
    }
  }
  handleShowPath(){
    this.setState({isShowPath:!this.state.isShowPath,bntLabel:this.state.isShowPath?'显示轨迹':'暂停播放'})
  }
  render(){
    return (
      <div className="App">
        <button onClick={this.handleShowPath.bind(this)}>{this.state.bntLabel}</button>
        <MainBox showPath={this.state.isShowPath}/>
      </div>
    );
  }
}

export default App;
