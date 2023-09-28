import React, {useState, useRef} from 'react';
import * as d3 from 'd3'
import './App.css';
import {Layout, Carousel, Form, Select, Radio, Divider, Typography, InputNumber, Button} from "antd";
const {Text} = Typography;
import Logo from "./static/logo";

import Main from "./Components/main";
import Dataset_scatter from "./Components/dataset_scatter";
import Line_chart from "./Components/line_chart";
import Circuit_diagram from "./Components/circuit_diagram";
import Angles_change from "./Components/angles_change";
import Encoder from "./Components/encoder";
import Matrix from "./Components/matrix";
import Heatmap from "./Components/heatmap";


const {Content, Header} = Layout




const layout_params = {
    'system_width' : 1270,
    'system_height': 700,
    'header_height': 30,

    'view_dataScatter_width': 0.185,
    'view_dataScatter_height': 0.34,
    'view_dataScatter_top': 0.075,
    'view_dataScatter_left': 0.012,

    'view_lineChart_width': 0.18,
    'view_lineChart_height': 0.25,
    'view_lineChart_top': 0.73,
    'view_lineChart_left': 0.01,

    'view_circuitDiagram_width':0.77,
    'view_circuitDiagram_height': 0.195,
    'view_circuitDiagram_top': 0.78,
    'view_circuitDiagram_left': 0.22,


    'view_anglesChange_width': 0.175,
    'view_anglesChange_height': 0.25,
    'view_anglesChange_top': 0.73,
    'view_anglesChange_left': 0.015,


    'view_encoder_width': 0.14,
    'view_encoder_height': 0.27,
    'view_encoder_top': 0.08,
    'view_encoder_left': 0.23,


    'view_matrix_width': 0.58,
    'view_matrix_height': 0.65,
    'view_matrix_top': 0.08,
    'view_matrix_left': 0.4,


    'view_heatmap_width': 0.16,
    'view_heatmap_height': 0.58,
    'view_heatmap_top': 0.38,
    'view_heatmap_left': 0.22,

    
    'controlPanel_width': 0.175,
    'controlPanel_height': 0.56,
    'controlPanel_top': 0.42,
    'controlPanel_left': 0.015,


}


function App() {


  const [param_algo, setAlgo] = useState('')
    let [data_point, setDataPoint] = useState('data_88')
    let [epoch, setEpoch] = useState('1')


  //导览所用变量
  const ref1 = useRef(null);

  const epoch_ref = useRef(epoch)

  function handle_epoch_change(event){
      epoch_ref.current =  `${event}`
  }


  function handle_epoch_click(){
      // console.log(epoch_ref.current)
      setEpoch(epoch_ref.current)
  }



  return (

      <>

          <Layout>
              <Content className={'contentStyle'} style={{ width: `${layout_params.system_width}px`, height: `${layout_params.system_height}px`}}>
                  <Header className={'header_style'} style={{height: `${layout_params.header_height}px`}}>
                      <div>

                          <Logo></Logo>

                          <span className="system-title">VisionQ</span>
                          <span className="paper-title">Visualizing and Understanding Variational Quantum Circuit</span>
                      </div>

                  </Header>

                  
                  {/*Control Panel*/}
                  <div style={{
                      width: layout_params.system_width * layout_params.controlPanel_width,
                      height: layout_params.system_height * layout_params.controlPanel_height,
                      position: 'absolute',
                      top: layout_params.system_height * layout_params.controlPanel_top,
                      left: layout_params.system_width * layout_params.controlPanel_left,
                      borderRadius: '8px',
                      border:'solid 1px #000000',
                  }}>

                      <Divider plain style={{margin:'5px 0 0 0'}}><Text style={{fontSize: '0.8em'}} strong>Control Panel</Text></Divider>


                      <Form
                          style={{
                              padding: '10px'
                          }}
                          size={'small'}
                      >
                          <Form.Item label={"Dataset"}>
                              <Select className={''} defaultValue={'data_moons'} onChange={1} >
                                  <Select.Option value="data_moons">Data Moons</Select.Option>
                                  {/*<Select.Option value="QFT">QFT Algorithm</Select.Option>*/}
                              </Select>
                          </Form.Item>

                          <Form.Item label={"Measure"}>
                              <Radio.Group value={'zii'} >
                                  <Radio.Button value="zii" style={{fontFamily: 'Times New Roman'}}>'ZII'</Radio.Button>
                                  <Radio.Button value="izi" style={{fontFamily: 'Times New Roman'}}>'IZI'</Radio.Button>
                                  <Radio.Button value="iiz" style={{fontFamily: 'Times New Roman'}}>'IIZ'</Radio.Button>
                              </Radio.Group>
                          </Form.Item>


                          <Form.Item label={"Test display"}>
                              <Select className={''} defaultValue={'testing'} onChange={1} >
                                  <Select.Option value="testing">Testing</Select.Option>
                                  <Select.Option value="training">Training</Select.Option>
                                  <Select.Option value="both">Both</Select.Option>
                              </Select>
                          </Form.Item>


                          <Text>Statistic Selection：</Text>
                          <Form.Item>
                              <Radio.Group value={'loss_acc'}>
                                  <Radio.Button value="loss_acc">Loss and accuracy</Radio.Button>
                                  <Radio.Button value="angles">Angles</Radio.Button>
                              </Radio.Group>
                          </Form.Item>


                          <Divider plain style={{margin:'5px 0 0 0'}}><Text style={{fontSize: '0.8em'}} strong>Statistics</Text></Divider>
                      </Form>



                  </div>


                  <Dataset_scatter config={layout_params} setDataPoint={setDataPoint}  datapoint={data_point}></Dataset_scatter>
                  <Line_chart config={layout_params} ></Line_chart>
                  {/*<Angles_change config={layout_params}></Angles_change>*/}
                  <Circuit_diagram config={layout_params}></Circuit_diagram>
                  <Encoder config={layout_params} datapoint={data_point}></Encoder>
                  <Matrix config={layout_params} dataset={'data_moons'} datapoint={data_point}></Matrix>
                  <Heatmap config={layout_params} epoch={epoch}></Heatmap>


                  <Form.Item label={"Epoch"} style={{'position':'absolute', 'left': "295px", 'top': '480px'}}>
                      <InputNumber id={'view2-button'}
                                   defaultValue={epoch}
                                   style={{width: '70px'}}
                                   onChange={handle_epoch_change}
                      />
                      <Button style={{width: '40px', marginLeft: "10px"}} onClick={handle_epoch_click}>&#10003;</Button>
                  </Form.Item>



                  <svg width={layout_params.system_width} height={layout_params.system_height} style={{position: "absolute", top: '0px', left: '0px',zIndex:-999}}>
                      <line x1={layout_params.system_width*layout_params.view_dataScatter_width/0.95} y1={layout_params.system_height*layout_params.view_dataScatter_height/1.5}
                            x2={layout_params.system_width*layout_params.view_encoder_left/1.015} y2={layout_params.system_height*layout_params.view_dataScatter_height/1.5}
                            stroke="#d4eaff"
                            strokeWidth="30"
                            strokeDasharray="5"
                      className={'path_animation'}
                      ></line>

                      <line x1={layout_params.system_width*layout_params.view_dataScatter_width*1.99} y1={layout_params.system_height*layout_params.view_dataScatter_height/1.5}
                            x2={layout_params.system_width*layout_params.view_dataScatter_width*2.15} y2={layout_params.system_height*layout_params.view_dataScatter_height/1.5}
                            stroke="#d4eaff"
                            strokeWidth="30"
                            strokeDasharray="5"
                            className={'path_animation'}
                      ></line>
                  </svg>



              </Content>
          </Layout>

      </>


  );
}

export default App;
