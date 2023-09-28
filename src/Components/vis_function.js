import * as d3 from 'd3'
import { schemeYlGn, schemeYlGnBu, schemeSet1, schemeSet2, schemeSet3, schemeTableau10, schemePastel1 } from 'd3-scale-chromatic';


function vis_function(class_name, data_point, epoch, data_step, colorList){

    /*
    * data_point: e.g., 'data_0'
    * epoch: e.g., 'epoch_0'
    * data_step: e.g., {res.data}
    * */


    let svg = d3.select(`.${class_name}`)
    const margin = { top: +svg.attr("width")*0.17, right: +svg.attr("height")*0.19, bottom: +svg.attr("height")*0.16, left:+svg.attr("width")*0.2 };
    const length = d3.min([+svg.attr("width") - margin.left - margin.right, +svg.attr("height")  - margin.top - margin.bottom])


    const axis_length = length * 0.3, axis_color = '#595959'
    const circle_r = 4, bs_lineWidth = 1.5, bs_maxLineWidth = 9
    const bs_circleLayout_r = axis_length/2+5
    const stackedBarChart_maxHeight = length*0.3, stackedBarChart_barWidth = length * 0.1


    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px");


    const tooltip2 = d3.select("body").append("div")
        .attr("class", "tooltip2")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px");




    /*处理数据*/
    const basis_states = data_step[epoch]['states'][data_point]


    const bitstring_num = Object.keys(basis_states).length
    const qubit_num = Math.log2(bitstring_num)
    const bitstrings = generateStates(qubit_num)

    /*data_states: 就是要可视化的数据的states*/
    let data_states = Object.values(basis_states).map(item=>item.prob).map((prob, i)=>{
        return {
            'bitstring': bitstrings[i],
            'prob': prob
        }
    })

    // console.log('data_states', data_states)


    let all_axes

    if(qubit_num===3){

        let distance = length/2

        let qubit0_0 = [-axis_length/2, distance]
        let qubit0_1 = [+axis_length/2, distance]


        let qubit1_midPoint = [+distance*Math.cos(30*Math.PI/180), -distance*Math.sin(30*Math.PI/180)]
        let qubit1_0 = [qubit1_midPoint[0]+(axis_length/2 * Math.cos(60*Math.PI/180)), qubit1_midPoint[1]+axis_length/2 * Math.sin(60*Math.PI/180)]
        let qubit1_1 = [qubit1_midPoint[0]-axis_length/2 * Math.sin(30*Math.PI/180), qubit1_midPoint[1]-axis_length/2 * Math.cos(30*Math.PI/180)]

        let qubit2_0 = [-qubit1_1[0], qubit1_1[1]]
        let qubit2_1 = [-qubit1_0[0], qubit1_0[1]]

        all_axes = [[qubit0_0, qubit0_1], [qubit1_0, qubit1_1], [qubit2_0, qubit2_1]]


    }


    function generate_axis_position(axis_for_axis){

        let distance = length/2

        let qubit1_midPoint = [+distance*Math.cos(30*Math.PI/180), -distance*Math.sin(30*Math.PI/180)]

        return [
            [[-axis_for_axis/2, distance],  [+axis_for_axis/2, distance]],
            [[qubit1_midPoint[0]+(axis_for_axis/2 * Math.cos(60*Math.PI/180)), qubit1_midPoint[1]+axis_for_axis/2 * Math.sin(60*Math.PI/180)], [qubit1_midPoint[0]-axis_for_axis/2 * Math.sin(30*Math.PI/180), qubit1_midPoint[1]-axis_for_axis/2 * Math.cos(30*Math.PI/180)]],
            [[-qubit1_midPoint[0]+axis_for_axis/2 * Math.sin(30*Math.PI/180), qubit1_midPoint[1]-axis_for_axis/2 * Math.cos(30*Math.PI/180)], [-qubit1_midPoint[0]-(axis_for_axis/2 * Math.cos(60*Math.PI/180)), qubit1_midPoint[1]+axis_for_axis/2 * Math.sin(60*Math.PI/180)]]

        ]
    }

    // console.log('all_axes', all_axes)


    /*构建颜色比例尺， 测试将prob encode在线段的颜色上*/
    // const lineScale = d3.scaleSequential()
    const lineScale = d3.scalePow()
            .domain([0, 1])
        .range(colorList)
        // .range(['#eeebfd', '#7f30cb'])
        // .range([1, bs_maxLineWidth])
        .exponent(0.55)

    // console.log(schemeSet2)

    // function lineScale(n){
    //     const lineScale_ = d3.scaleSymlog()
    //         .domain([-1, 1])
    //         .range([schemeYlGn[8][0], schemeYlGn[8][7]])
    //         // .range([0,100])
    //         .constant(0.8)
    //     // .exponent(0.5)
    //
    //
    //     return lineScale_(n-0.5)
    // }


    /*开始画图*/

    const gateColors = {
        'rx': '#289D76',
        'rz': '#e06c82',
        'ry': '#7763c0',
        'cx': '#645e73',
        'measure': '#287e9d'
    };



    const group = svg
        .append("g")
        .attr("transform", `translate(${margin.left + length/2}, ${margin.top + length/2})`)
        .attr('class', 'satellite_group')




    /*画 坐标轴*/
    group.selectAll('.null')
        .data(generate_axis_position(length * 0.3 + 20))
        .join('line')
        .attr('x1', d=>d[0][0])
        .attr('y1', d=>d[0][1])
        .attr('x2', d=>d[1][0])
        .attr('y2', d=>d[1][1])
        .attr('stroke', axis_color)
        .attr('stroke-width', 1)


    if(class_name==='svg_encoder'){
        for (let i=0; i<=1; i++){
            group.selectAll('.null')
                .data(generate_axis_position(length * 0.3 + 55))
                .join('text')
                .attr("x", d=>d[i][0]-Math.sign(d[i][0])*length*0.1)
                .attr("y", d=>d[i][1])
                .attr("text-anchor", "middle")
                // .attr("font-weight", 700)
                .attr('font-size', '0.9em')
                .attr("dy", ".95em")
                .text((_,index)=>`q${index}=${i}`)
        }
    }




    /*开始画中间的 圆圈组成的 环*/
    group.selectAll('.null')
        .data(data_states)
        .join('circle')
        .attr("class", d=>`bs_${d['bitstring']}`)
        .attr("cx", (d,i)=>bs_circleLayout_r * Math.cos(i * (2 * Math.PI / bitstring_num)))
        .attr("cy", (d,i)=>bs_circleLayout_r * Math.sin(i * (2 * Math.PI / bitstring_num)))
        .attr("r", circle_r)
        .attr("fill", d => '#000000')
        .attr("stroke", "#f5f5f5")


    data_states.forEach((bs, i)=>{
        let bitstrings = bs['bitstring'].split('')

        bitstrings.forEach((bitstring, qubit)=>{
            let target = all_axes[qubit][+bitstring]
            let source = [+d3.select(`.bs_${bs['bitstring']}`).attr('cx'), +d3.select(`.bs_${bs['bitstring']}`).attr('cy')]


            // /*把已有的端点的line-width加一起*/
            // let existingLineWidthSum = 0
            // d3.selectAll(`.q${qubit}_${+bitstring}`).nodes().forEach((a,b)=>{
            //     existingLineWidthSum += +a.getAttribute('stroke-width')
            // })
            //
            // let theta = Math.atan(target[1]/target[0])
            //
            // console.log(existingLineWidthSum)


            group.append('line')
                .attr("class", `bs_${bs['bitstring']} line_bs_${bs['bitstring']} q${qubit}_${+bitstring}`)
                .attr('x1', target[0])
                .attr('y1', target[1])
                .attr('x2', source[0])
                .attr('y2', source[1])
                .attr('stroke', lineScale(bs['prob']))
                // .attr('stroke', schemeTableau10[i])
                .attr('stroke-width', bs_lineWidth)
                // .attr('stroke-width', lineScale(bs['prob']))

        })

    })



    /*开始画中间的 圆圈组成的 环*/
    group.selectAll('.null')
        .data(data_states)
        .join('circle')
        .attr("class", d=>`bs_${d['bitstring']}`)
        .attr("cx", (d,i)=>bs_circleLayout_r * Math.cos(i * (2 * Math.PI / bitstring_num)))
        .attr("cy", (d,i)=>bs_circleLayout_r * Math.sin(i * (2 * Math.PI / bitstring_num)))
        .attr("r", circle_r)
        .attr("fill", d => lineScale(d['prob']))
        // .attr("fill", (d,i)=>{
        //     return schemeTableau10[i]
        // })
        .attr("stroke", "#ffffff")
        .on('mouseover', function(_,d){
            tooltip.transition()
                .duration(200)
                .style('display', 'block')
                .style("opacity", .9);
            tooltip.html(`Bitstring: "${d.bitstring}" <br/> Prob: ${d['prob']}`)
                .style("left", (event.pageX+5) + "px")
                .style("top", (event.pageY - 28) + "px");

            let classname = d3.select(this).attr('class')
            d3.select(this).attr('r', circle_r*2)
            d3.selectAll(`.line_${classname}`).attr('stroke-width', bs_lineWidth*2)

        })
        .on('mouseout', function(d,i){

            tooltip.transition()
                .duration(200)
                .style('display', 'none')
                .style("opacity", 0);
            let classname = d3.select(this).attr('class')
            d3.select(this).attr('r', circle_r)
            d3.selectAll(`.line_${classname}`).attr('stroke-width', bs_lineWidth)

        })




    /*开始画每个qubit的stacked bar chart*/
    let qubit_prob = {}
    if(qubit_num===3){
        qubit_prob['q0_0'] = {'total_prob': 0, 'basis_states':[]}
        qubit_prob['q0_1'] = {'total_prob': 0, 'basis_states':[]}
        qubit_prob['q1_0'] = {'total_prob': 0, 'basis_states':[]}
        qubit_prob['q1_1'] = {'total_prob': 0, 'basis_states':[]}
        qubit_prob['q2_0'] = {'total_prob': 0, 'basis_states':[]}
        qubit_prob['q2_1'] = {'total_prob': 0, 'basis_states':[]}
    }

    data_states.forEach((item,i)=>{
        item['bitstring'].split('').forEach((digit, qubit)=>{
            qubit_prob[`q${qubit}_${digit}`]['total_prob']  = qubit_prob[`q${qubit}_${digit}`]['total_prob'] + item['prob']
            qubit_prob[`q${qubit}_${digit}`]['basis_states'].push(item)
            qubit_prob[`q${qubit}_${digit}`]['qubit'] = qubit
            qubit_prob[`q${qubit}_${digit}`]['digit'] = digit
        })

    })

    // console.log(qubit_prob)

    const y = d3.scaleLinear()
        .domain([0, 1])   // since it's a probability, max is 1
        .range([2, stackedBarChart_maxHeight]);


    group.selectAll('.null')
        .data(Object.values(qubit_prob))
        .join('g')
        .attr('transform', d=>{

            let degree = 0
            let x =all_axes[d['qubit']][+d['digit']][0]
            let y =all_axes[d['qubit']][+d['digit']][1]


            if(qubit_num===3){
                if(x>0 && y<0){
                    degree = -(120)
                }else if(x<0 && y<0){
                    degree = +(120)
                }else{
                    degree = 0
                }
            }


            return `translate(${x}, ${y}) rotate(${degree})`
        })
        .selectAll('.null')
        .data(d=>{
            let arr = []
            d['basis_states'].reduce((prev, cur, sn)=>{
                let new_arr = [prev, prev+cur['prob']]
                new_arr.data = cur
                arr.push(new_arr)
                return prev+cur['prob']
            }, 0)

            // console.log(arr)
            return arr
        })
        .join("rect")
        .attr("x",  - stackedBarChart_barWidth/2)
        .attr("y", d=>y(d[0])-2)
        .attr("rx", 1.5)
        .attr("height", d => y(d[1] - d[0]))
        .attr("width", stackedBarChart_barWidth)
        .attr('fill', (d,i)=>'#ffffff')
        // .attr('fill', (d,i)=>schemeTableau10[bitstrings.indexOf(d.data.bitstring)])
        .attr('stroke', colorList[1])
        // .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .on('mouseover', function(_, d){

            tooltip2.transition()
                .duration(200)
                .style('display', 'block')
                .style("opacity", .9);
            tooltip2.html(`Bitstring: "${d.data.bitstring}" <br/> Prob: ${d.data['prob']}`)
                .style("left", (event.pageX+5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d,i){

            tooltip2.transition()
                .duration(100)
                .style('display', 'none')
                .style("opacity", 0);
        })
        .lower()


    // var data = [
    //     { letter: { a: 3840, b: 1920, c: 960, d: 400 } },
    //     { letter: { a: 1600, b: 1440, c: 960, d: 400 } },
    //     { letter: { a: 640, b: 960, c: 640, d: 400 } },
    //     { letter: { a: 320, b: 480, c: 640, d: 400 } }
    // ];

    // data=[
    //     {a: 3840, b: 1920, c: 960, d: 400}
    // ]
    //
    // var stackGen = d3.stack()
    //     // Defining keys
    //     .keys(["a", "b", "c", "d"])
    //     // Defining value function
    //     .value((obj, key) => {
    //         console.log(key)
    //         return obj[key]
    //     });

    // var stack = stackGen(data);

    // const data_try = [
    //     {bitstring: '000', prob: 0.029},
    //     {bitstring: '001', prob: 0.074},
    //     {bitstring: '010', prob: 0.254},
    //     {bitstring: '011', prob: 0.151}
    // ];
    //
    // let arr = []
    //
    // console.log(data_try.reduce((prev, cur, sn)=>{
    //     let new_arr = [prev['prob'], prev+cur['prob']]
    //     new_arr.data = cur
    //     arr.push(new_arr)
    //     return prev+cur
    // }, 0))








}


/*生成 bitstring*/
function generateStates(n){
    let states = [];

    // Convert to decimal
    let maxDecimal = parseInt("1".repeat(n),2);

    // For every number between 0->decimal
    for(let i = 0; i <= maxDecimal; i++){
        // Convert to binary, pad with 0, and add to final results
        states.push(i.toString(2).padStart(n,'0'));
    }

    return states;
}


export default vis_function