import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import axios from 'axios'

function Circuit_diagram(props) {


    const {system_width, system_height} = props.config
    const {view_circuitDiagram_width, view_circuitDiagram_height, view_circuitDiagram_top, view_circuitDiagram_left} = props.config




    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_circuitDiagram_width
    const view_height = system_height * +view_circuitDiagram_height
    const position_top = system_height * +view_circuitDiagram_top
    const position_left = system_width * +view_circuitDiagram_left



    //定义是否mount的ref
    // const didMount = useRef(false)




    function render_view(){

        let circuitData = {
            'step_0':{
                'gate_0':{
                    'gate': 'RZ',
                    'wires': 0,
                },
                'gate_1':{
                    'gate': 'RZ',
                    'wires': 1
                },
                'gate_2':{
                    'gate': '',
                    'wires': 2
                }
            },
            'step_1':{
                'gate_0':{
                    'gate': 'RY',
                    'wires': 0
                },
                'gate_1':{
                    'gate': 'RY',
                    'wires': 1
                },
                'gate_2':{
                    'gate': '',
                    'wires': 2
                }
            },
            'step_2':{
                'gate_0':{
                    'gate': 'RZ',
                    'wires': 0,
                    'param_index': 0
                },
                'gate_1':{
                    'gate': 'RZ',
                    'wires': 1,
                    'param_index': 1
                },
                'gate_2':{
                    'gate': 'RZ',
                    'wires': 2,
                    'param_index': 2
                }
            },
            'step_3':{
                'gate_0':{
                    'gate': 'RY',
                    'wires': 0,
                    'param_index': 3
                },
                'gate_1':{
                    'gate': 'RY',
                    'wires': 1,
                    'param_index': 4
                },
                'gate_2':{
                    'gate': 'RY',
                    'wires': 2,
                    'param_index': 5
                }
            },
            'step_4':{
                'gate_0':{
                    'gate': 'RZ',
                    'wires': 0,
                    'param_index': 6
                },
                'gate_1':{
                    'gate': 'RZ',
                    'wires': 1,
                    'param_index': 7
                },
                'gate_2':{
                    'gate': 'RZ',
                    'wires': 2,
                    'param_index': 8
                }
            },
            'step_5':{
                'gate_0':{
                    'gate': 'CX',
                    'wires': [0,1]
                },
                'gate_1':{
                    'gate': '',
                    'wires': 0
                },
                'gate_2':{
                    'gate': '',
                    'wires': 0
                }
            },
            'step_6':{
                'gate_0':{
                    'gate': '',
                    'wires': 0
                },
                'gate_1':{
                    'gate': 'CX',
                    'wires': [1,2]
                },
                'gate_2':{
                    'gate': '',
                    'wires': 0
                }
            },
            'step_7':{
                'gate_0':{
                    'gate': '',
                    'wires': 0
                },
                'gate_1':{
                    'gate': '',
                    'wires': 0
                },
                'gate_2':{
                    'gate': 'CX',
                    'wires': [2,0]
                }
            },
            'step_8':{
                'gate_0':{
                    'gate': 'RY',
                    'wires': 0,
                    'param_index': 9
                },
                'gate_1':{
                    'gate': 'RY',
                    'wires': 1,
                    'param_index': 10
                },
                'gate_2':{
                    'gate': 'RY',
                    'wires': 2,
                    'param_index': 11
                }
            },
            'step_9':{
                'gate_0':{
                    'gate': 'Measure',
                    'wires': 0
                },
                'gate_1':{
                    'gate': '',
                    'wires': 1
                },
                'gate_2':{
                    'gate': '',
                    'wires': 2
                }
            },
        }


        const svg = d3.select(".svg_circuitDiagram");
        const margin = { top: 30, right: 30, bottom: 15, left:15 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height")  - margin.top - margin.bottom;
        const gateWidth = width / Object.keys(circuitData).length;
        const qubitHeight = height / 3; // Assuming 3 qubits for simplicity
        const gateSize = Math.min(gateWidth, qubitHeight) * 0.85; // Making gate symbol smaller


        const gateColors = {
            'RX': '#289D76',
            'RZ': '#e06c82',
            'RY': '#7763c0',
            'CX': '#645e73',
            'Measure': '#287e9d'
        };






        const group = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('class', 'circuit_diagram')

        group.append("rect")
            .attr("width", gateWidth*2-15)
            .attr("height", height*1.1)
            .attr('rx',10)
            .attr("stroke", "#F8CC3D")
            .attr('stroke-width', 2)
            .attr("fill", "transparent")
            .attr('transform', `translate(${10},${-5})`)
            // .attr('stroke', '#000000')
            .lower();



        group.append("rect")
            .attr("width", gateWidth*6.8)
            .attr("height", height*1.1)
            .attr('rx',10)
            .attr("stroke", "#F7A98E")
            .attr('stroke-width', 2)
            .attr("fill", "transparent")
            .attr('transform', `translate(${195},${-5})`)
            // .attr('stroke', '#000000')
            .lower();

        // 边框
        group.append("rect")
            .attr("width", width*1.02)
            .attr("height", height*1.3)
            .attr("fill", "transparent")
            .attr('stroke', '#000000')
            .attr('transform', `translate(${-10},${-15})`)
            .style('stroke-width', 1)
            .lower();


        // Draw qubit wires
        for (let i = 0; i < 3; i++) {
            group.append("line")
                .attr("x1", 0)
                .attr("y1", i * qubitHeight + qubitHeight / 2)
                .attr("x2", width)
                .attr("y2", i * qubitHeight + qubitHeight / 2)
                .attr("stroke", "black");
        }

        let stepIndex = 0;
        for (const step in circuitData) {
            for (const gate in circuitData[step]) {
                const gateData = circuitData[step][gate];

                const gateX = stepIndex * gateWidth + gateWidth / 2;
                const gateY = gateData.wires * qubitHeight + qubitHeight / 2;

                if (gateData.gate === 'CX') {
                    const controlY = gateData.wires[0] * qubitHeight + qubitHeight / 2;
                    const targetY = gateData.wires[1] * qubitHeight + qubitHeight / 2;

                    group.append("circle")
                        .attr("cx", gateX)
                        .attr("cy", controlY)
                        .attr("r", gateSize /10)
                        .attr("fill", gateColors['CX']);

                    group.append("line")
                        .attr("x1", gateX)
                        .attr("y1", controlY)
                        .attr("x2", gateX)
                        .attr("y2", targetY)
                        .attr("stroke", gateColors['CX'])
                        .attr('stroke-width', 1)

                    group.append("circle")
                        .attr("cx", gateX)
                        .attr("cy", targetY)
                        .attr("r", gateSize / 2)
                        .attr("fill", "#ffffff")
                        .attr('stroke-width', 1)
                        .attr("stroke", gateColors['CX']);

                    group.append("rect")
                        .attr("x", gateX - gateSize / 2-10)
                        .attr("y", targetY - gateSize / 2)
                        .attr("width", gateSize+20)
                        .attr("height", gateSize)
                        .attr('rx', 4)
                        .attr("fill", '#ffffff')
                        .attr('stroke', gateColors['CX'])
                        .attr('stroke-width', 1)

                    group.append("text")
                        .attr("x", gateX)
                        .attr("y", targetY)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        // .attr("font-weight", 700)
                        .attr('font-size', '0.9em')
                        .attr('fill', gateColors['CX'])
                        .text("CNOT");

                } else if (gateData.gate !== '') {
                    group.append("rect")
                        .attr("x", gateX - gateSize / 2-18)
                        .attr("y", gateY - gateSize / 2)
                        .attr("width", gateSize+36)
                        .attr("height", gateSize)
                        .attr('rx', 4)
                        .attr("fill", '#ffffff')
                        .attr('stroke', gateColors[gateData.gate])
                        .attr('stroke-width', 1)

                    const gateText = group.append("text")
                        .attr("x", gateX)
                        .attr("y", gateY)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .attr('fill', gateColors[gateData.gate])
                        .attr('class', d => {
                            if (gateData.gate === 'Measure') {
                                return 'measure_gate'
                            }
                        });

                    if (typeof gateData.param_index !== 'undefined' && gateData.gate !== 'M') {
                        // Adding gate name (like RY) and make it bold
                        gateText.append("tspan")
                            // .attr("font-weight", 700)
                            .text(gateData.gate + "(");

                        // Adding "θ" without bold styling
                        gateText.append("tspan")
                            .text("θ");

                        // Adding parameter index as subscript without bold styling
                        gateText.append("tspan")
                            .attr("baseline-shift", "sub")
                            .attr("font-size", "0.7em")
                            .text(gateData.param_index);

                        // Closing the parenthesis without bold styling
                        gateText.append("tspan")
                            .attr("baseline-shift", "baseline")
                            .attr("font-size", "1em")
                            .text(")");
                    } else {
                        gateText.text(gateData.gate);
                    }

                }
            }

            stepIndex++;
        }

        // Labels
        group.append("text")
            .attr("x", gateWidth)
            .attr("y", 90)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text("Encoder");

        group.append("text")
            .attr("x", gateWidth*5.5)
            .attr("y", 90)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text("Ansatz");

    }






    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        render_view()

    }, [])





    // // 当 algo 更新的时候update
    // useEffect(()=>{
    //
    //     // 跳过第一次 mount
    //     if(!didMount.current){
    //         didMount.current = true
    //
    //         return
    //     }
    //
    //
    // }, [param_algo])


    return (

        <div>
            <svg className={'svg_circuitDiagram'}
                 width={view_width}
                 height={view_height}
                 style={{'position': "absolute", 'top': position_top, 'left': position_left}}></svg>

        </div>
    )



}


export default Circuit_diagram