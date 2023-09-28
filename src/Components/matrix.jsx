import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3'
import axios from 'axios'
import vis_function from "./vis_function";



function Matrix(props){


    let didMount = useRef(false)

    /*获得参数*/
    const dataset = props.dataset
    const data_point = props.datapoint


    const { system_width, system_height } = props.config;
    const { view_matrix_width, view_matrix_height, view_matrix_top, view_matrix_left } = props.config;



    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_matrix_width
    const view_height = system_height * +view_matrix_height
    const position_top = system_height * +view_matrix_top
    const position_left = system_width * +view_matrix_left

    const test_width = 0


    // Define the matrix dimensions
    const cell_width_unfolded = view_width*0.19
    const cell_width_folded = view_width*0.045
    const cell_height = view_width*0.2
    const gateLabel_width = view_width*0.05


    // function render_view(data){
    //
    //
    //
    //     console.log(d3.range(6))
    //
    // }
    //



    let epoch_num = 100, step_num = dataset==='data_moons'? 5: 0

    let [isFolded, setIsFolded] = useState(d3.range(epoch_num).map(d=>d3.range(step_num).map(d=>true)))




    const renderCell = (epoch, step) => {
        if (isFolded[epoch][step]) {
            return <></>;
        } else {

            return (
/*
                <div className="step-unfolded" onClick={() => toggleFold(step)} style={{width: cell_width_unfolded, height:cell_height}} key={step}>
*/
                    <svg className={`svg_satellite satellite_${epoch}_${step}`}
                                  width={cell_width_unfolded-5}
                                  height={cell_height-5}
                                  style={{
                                      'margin': '10px 5px 10px 1px',
                                      'border':'solid 1px #325427'
                                  }}
                         id={`${epoch}_${step}`}
                    ></svg>
                /*</div>*/
            );
        }
    };



    const toggleFold = (step) => {
        setIsFolded((prevState) => {
            const newState = [...prevState];
            newState.forEach((arr,i)=>{
                newState[i][step] = !newState[i][step]
            })
            return newState;
        });
    };


    const renderLabel = (epoch ,step)=>{

        const max_change = 0.65
        const donut_interval = 40
        const donut_r = 17

        let gates_in_step = [
            ["rz00","rz10","rz20"],
            ["ry01","ry11","ry21"],
            ["rz02","rz12","rz22"],
            ['cx', 'cx', 'cx'],
            ["ry03","ry13","ry23"]
        ]

        d3.selectAll('.cell_label').each(function(d,i){
            let [epoch, step] = d3.select(this).attr('id').split('_')

            axios.get(`database/angles/${dataset}/angles.json`)
                .then(res => {
                    let data = res.data[`epoch_${+epoch+1}`]['angles']

                    let base = {
                        "rz00": 2.565,
                        "rz10": 0.13,
                        "rz20": 1.951,
                        "ry01": 3.047,
                        "ry11": 3.045,
                        "ry21": 0.651,
                        "rz02": 1.685,
                        "rz12": 2.283,
                        "rz22": 3.053,
                        "ry03": 1.901,
                        "ry13": 2.62,
                        "ry23": 0.469
                    }


                    let group = d3.select(this)
                        .append('g')
                        .attr('transform', `translate(${d3.select(this).attr('width')/2},${0})`)

                    // console.log(epoch,step)
                    // console.log(gates_in_step[+step])
                    gates_in_step[+step].forEach((gate,index)=>{
                        const temp_data = [
                            { label: 'change', value: gate[0]==='cx'? '': Math.abs(Math.abs(+data[gate]) - base[gate]) },
                            { label: 'rest', value:  gate[0]==='cx'? '': Math.abs(max_change - (Math.abs(+data[gate]) - base[gate] ))},
                        ]

                        let label = group.append('g')
                            .attr('transform', `translate(${0},${30+index*donut_interval})`)

                        const arc = d3.arc()
                            .innerRadius(donut_r * 0.7)  // This will create the donut hole
                            .outerRadius(donut_r);

                        const pie = d3.pie()
                            .value(function(d) { return d.value; })
                            .sort(null);


                        let variable = label.selectAll('path')
                            .data(pie(temp_data))
                            .enter().append('path')
                            .attr('d', arc)
                            .attr('fill', (d,i)=>['#4DA4ED', '#f0f0f0'][i])

                        // console.log(variable.data())


                        label.append('text')
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("text-anchor", "middle")
                            // .attr("font-weight", 700)
                            .attr('font-size', '0.7em')
                            .attr("dy", ".35em")
                            .text(d=>{

                                const index = Object.keys(data).indexOf(gate)
                                const gate_name = gate.replace(/[^a-z]/gi, '')

                                if(index===-1){
                                    return 'CX'
                                }

                                // console.log(index, gate_name)
                                // return `${gate_name.toUpperCase()}(θ${index})`
                                return `θ${index}`
                            })

                    })


                    group.append('text')
                        .attr("x", 0)
                        .attr("y", d3.select(this).attr('height')/1.2)
                        .attr("text-anchor", "middle")
                        // .attr("font-weight", 700)
                        .attr('font-size', '0.7em')
                        .attr("dy", ".35em")
                        .html(`epoch ${+epoch+1}`)


                    group.append('text')
                        .attr("x", 0)
                        .attr("y", d3.select(this).attr('height')/1.1)
                        .attr("text-anchor", "middle")
                        // .attr("font-weight", 700)
                        .attr('font-size', '0.7em')
                        .attr("dy", ".35em")
                        .html(`step ${step}`)


                })



        })



    }





    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        renderLabel()/*不管render satellite与否，都render 每个cell的gate的图*/


    }, [])


    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }

        // console.log(d3.selectAll('.svg_satellite').size())

        if(d3.selectAll('.svg_satellite').size()==0){
            return
        }



        let colorList = {
            'encoder': ["#ffffff", '#000000'],
            'ansatz': ["#F7FCB9", '#00482a'],
        }

        d3.selectAll('.svg_satellite').each(function(d,i){
            // console.log(d,i, this)
            let [epoch, step] = d3.select(this).attr('id').split('_')
            /*step文件名的计数实际上是从1开始的，从0开始的是encoder*/
            // console.log(epoch, step, data_point)

        axios.get(`database/encoding_ansatz/${dataset}/step${+step+1}.json`)
            .then(res => {
                vis_function(`satellite_${epoch}_${step}`, data_point, `epoch_${+epoch+1}`, res.data,  colorList['ansatz'])

            })
        })


    }, [isFolded])




    // 当 algo 更新的时候update
    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }


        // d3.selectAll('.svg_satellite').remove()
        //
        // // console.log(data_point)
        //
        //
        // setIsFolded(d3.range(epoch_num).map(d=>d3.range(step_num).map(d=>true)))

        setIsFolded(d3.range(epoch_num).map(d=>d3.range(step_num).map(d=>true)))



    }, [data_point])






    return (

            <div className="matrix"
                 style={{'width':view_width,
                     'height':view_height,
                     'position': "absolute", 'top': position_top, 'left': position_left,
                     'overflowX': 'scroll',
                     'overflowY': 'scroll',
                     'whiteSpace': 'nowrap',
                     // 'border':'solid 1px #000000',
                 }}>

                {d3.range(epoch_num).map(epoch=>
                    <div key={epoch} className={`epoch_${epoch} epoch`}>
                        {d3.range(step_num).map(step=>{
                            return (
                                <div className="step-folded" id={`${epoch}_${step}`} onClick={() => toggleFold(step)} style={{minWidth: cell_width_folded, height:cell_height+25}} key={step}>
                                    <svg className={'cell_label'} id={`${epoch}_${step}`} width={view_width*0.06} height={cell_height+25}>

                                    </svg>
                                    {renderCell(epoch ,step)}
                                </div>

                            )

                        })}
                    </div>
                )}


            </div>


    )
}




export default Matrix;
