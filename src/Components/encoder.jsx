import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import axios from 'axios'
import vis_function from "./vis_function";

function Encoder(props) {

    const didMount = useRef(false)


    /*parameters*/
    let data_point = props.datapoint


    const {system_width, system_height} = props.config
    const {view_encoder_width, view_encoder_height, view_encoder_top, view_encoder_left} = props.config



    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_encoder_width
    const view_height = system_height * +view_encoder_height
    const position_top = system_height * +view_encoder_top
    const position_left = system_width * +view_encoder_left



    const gateColors = {
        'rx': '#289D76',
        'rz': '#e06c82',
        'ry': '#7763c0',
        'cx': '#645e73',
        'measure': '#287e9d'
    };





    function render_view(data){

        let colorList = {
            'encoder': ["#efefef", '#000000'],
            'ansatz': ["#F7FCB9", '#00482a'],
        }

        axios.get(`database/encoding_ansatz/data_moons/step0.json`)
            // axios.get(`data/temp.json`)
            .then(res => {
                vis_function('svg_encoder', data, 'epoch_80', res.data, colorList['encoder'])
                // vis_function('svg_encoder', 'data_0', 'epoch_50', res.data)

            })



    }








    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {


        render_view(data_point)


    }, [])





    // 当 algo 更新的时候update
    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }

        d3.select('.satellite_group').remove()
        render_view(data_point)



    }, [data_point])


    return (

        <div>
            <svg className={'svg_encoder'}
                 width={view_width}
                 height={view_height}
                 style={{'position': "absolute", 'top': position_top, 'left': position_left, 'borderRadius': '8px',
                     'border':'solid 1px #000000'
                 }}></svg>

        </div>
    )



}


export default Encoder


