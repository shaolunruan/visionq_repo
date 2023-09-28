import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import axios from 'axios'
import vis_function from "./vis_function";

function Heatmap(props) {


    // parameters
    let epoch = `epoch_${props.epoch}`


    const didMount = useRef(false)
    let unit_displayed = useRef(false)


    const {system_width, system_height} = props.config
    const {view_heatmap_width, view_heatmap_height, view_heatmap_top, view_heatmap_left} = props.config


    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_heatmap_width
    const view_height = system_height * +view_heatmap_height
    const position_top = system_height * +view_heatmap_top
    const position_left = system_width * +view_heatmap_left

    const legend_height = 25



    const width_svg = view_width-5





    function render_heatmap(data){


        // let epoch = 'epoch_100'



        // console.log(data)

        let final_state = data[epoch]['final_state']

        // console.log(final_state)




        const svg = d3.select(".svg_heatmap");

        const margin = { top: 30, right: 10, bottom: 10, left:10 };
        const width = +svg.attr("width") - margin.left - margin.right;
        // const height = +svg.attr("height") - margin.top - margin.bottom;


        const Num_points = Math.sqrt(data.epoch_1.measure.length)
        const folded_donutRadius = width*0.03



        const group = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.right})`)
            .attr('class', 'heatmap_group')


        const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1, 1]).range([width, 0]);


        let unit = group.selectAll('.null')
            .data(Object.values(final_state))
            .join('g')
            .attr('class', `unit`)
            .attr('transform', d=>`translate(${xScale(d['feature'][0])},${yScale(d['feature'][1])})`)
            .on('click', function(_,d){
                render_unit(d, epoch)
            })

        let colorScale_outer = d3.scaleOrdinal()
            .domain(['digit_0', 'digit_1'])
            .range(['#98c3ec','#f3bfbf'])

        /*画外环*/
        unit
            .selectAll('.null')
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states

                return d3.pie()
                    .value(d=>d.value).sort(null)
                    ([
                        {key: 'digit_1', value: bs_4+bs_5+bs_6+bs_7},
                        {key: 'digit_0', value: bs_0+bs_1+bs_2+bs_3}
                    ])
            })
            .enter().append('path')
            .attr('d', d3.arc()
                .innerRadius(folded_donutRadius * 0.8)  // This will create the donut hole
                .outerRadius(folded_donutRadius))
            .attr('fill', (d,i)=>colorScale_outer(d.data.key))



        let colorScale_inner = d3.scaleOrdinal()
            .domain(['positive_digit_1', 'positive_digit_0', 'negative_digit_1','negative_digit_0'])
            .range(['#ffffff','#2688F0','#E6078D', '#ffffff'])

        /*画内部的扇形*/
        unit
            .selectAll('.null')
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states

                let diff = (bs_0+bs_1+bs_2+bs_3) - (bs_4+bs_5+bs_6+bs_7)

                let arr = []
                // console.log(diff)
                if(diff>=0){
                    arr = [
                        // {key: 'digit_1', value: Math.abs(diff)},
                        // {key: 'digit_0', value: 1-Math.abs(diff)}
                        {key: 'positive_digit_1', value: 1-diff},
                        {key: 'positive_digit_0', value: diff}
                    ]
                }else{
                    arr = [
                        {key: 'negative_digit_1', value: Math.abs(diff)},
                        {key: 'negative_digit_0', value: 1-Math.abs(diff)}
                    ]
                }

                return d3.pie()
                    .value(d=>d.value).sort(null)
                    (arr)
            })
            .enter().append('path')
            .attr('d', d3.arc()
                .innerRadius(0)  // This will create the donut hole
                .outerRadius(folded_donutRadius*0.6))
            .attr('fill', d=>colorScale_inner(d.data.key))


        /*画legend*/

        let legend = svg.append('g')
            .attr('transform', `translate(${0},${width})`)

        let legend_arr = [{'label': 'class A', 'color': '#2688F0'},
            {'label': 'class B', 'color': '#E6078D'}]

        legend_arr.forEach((item, i) => {

            const gap_width = width/legend_arr.length

            const legendItem = legend.append("g")
                .attr("transform", `translate(${i*gap_width+20},${7})`);

            legendItem.append("circle") // Add circles for legend
                .attr("cx", 10)
                .attr("cy", 10)
                .attr("r", 4)
                .attr("fill", item['color']);

            // Create a text element for legend
            legendItem
                .append("text")
                .attr("x", 17)
                .attr("y", 10)
                .attr("dy", ".35em")
                .text(item['label'])

        });


        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "heatmap_container_div")
            .style("opacity", 0) // Initialize as invisible
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding-top", "5px")
            .style("border", "1px solid #909090")
            .style("border-radius", "8px");






    }



    function render_train(data){


        let epoch = 'epoch_100'




        let r = 4

        const svg = d3.select(".svg_heatmap");

        const margin = { top: 10, right: 10, bottom: 10, left:10 };
        const width = +svg.attr("width") - margin.left - margin.right;
        // const height = +svg.attr("height") - margin.top - margin.bottom;


        const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1, 1]).range([width, 0]);
        const colorScale = d3.scaleOrdinal().domain([-1, 1]).range(["#E6078D", "#2688F0"]);


        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0) // Initialize as invisible
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("border-radius", "3px");



        const group = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.right})`)
            .attr('class', 'heatmap_group')



        group.selectAll("circle")
            .data(Object.values(data))
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.data[0]))
            .attr("cy", d => yScale(d.data[1]))
            .attr("r", 3)
            .attr("fill", d => colorScale(d.target))
            .attr("stroke", "#ffffff")
            .attr('stroke-width', 1)
            .on('mouseover', function(d,i){

                // console.log(d3.select(this).data())

                tooltip.transition()
                    .duration(600)
                    .style("opacity", 0.9);

                tooltip.html("x1: " + d3.select(this).data()[0]['data'][0].toFixed(2) + "<br>x2: " + d3.select(this).data()[0]['data'][1].toFixed(2))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function(d,i){
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 3);
            })

    }


    function render_valid(data){


        let epoch = 'epoch_100'




        let r = 4

        const svg = d3.select(".svg_heatmap");

        const margin = { top: 10, right: 10, bottom: 10, left:10 };
        const width = +svg.attr("width") - margin.left - margin.right;
        // const height = +svg.attr("height") - margin.top - margin.bottom;


        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0) // Initialize as invisible
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("border-radius", "3px");


        const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1, 1]).range([width, 0]);
        const colorScale = d3.scaleOrdinal().domain([-1, 1]).range(["#E6078D", "#2688F0"]);


        const group = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.right})`)
            .attr('class', 'heatmap_group')



        group.selectAll("circle")
            .data(Object.values(data))
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.data[0]))
            .attr("cy", d => yScale(d.data[1]))
            .attr("r", r)
            .attr("fill", d => colorScale(d.target))
            .attr("stroke", "#000000")
            .attr('stroke-width', 1)
            .on('mouseover', function(d,i){

                console.log(d3.select(this).data())

                tooltip.transition()
                    .duration(600)
                    .style("opacity", 0.9);

                tooltip.html("x1: " + d3.select(this).data()[0]['data'][0].toFixed(2) + "<br>x2: " + d3.select(this).data()[0]['data'][1].toFixed(2))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function(d,i){
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", r);
            })


    }




    function render_unit(unit_data, epoch){

        if (unit_displayed.current==true){
            d3.select('.heatmap_container_div').transition()
                .duration(300)
                .style("opacity", 0)

            unit_displayed.current=false

            return
        }



        unit_displayed.current=true

        // console.log(unit_displayed.current)

        d3.select('.heatmap_container_div').transition()
            .duration(600)
            .style("opacity", 1)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");

        d3.select('.heatmap_zoomIn')
            .remove()


        // console.log(epoch)
        // console.log(unit_data, epoch)


        const margin = { top: 10, right: 10, bottom: 0, left:10 };
        const width = +view_width - margin.left - margin.right;

        const unfolded_donutRadius = width*0.8


        /*开始创建 */
        let svg = d3.select('.heatmap_container_div')
            .append('svg')
            .attr('width', width)
            .attr('height', width)
            .attr('class', 'heatmap_zoomIn')
            // .attr('transform', `translate(${100},${100})`)

        // svg.append("rect")
        //     .attr('transform', `translate(${margin.left},${0})`)
        //     .attr("width", view_width-2*margin.right)
        //     .attr("height", view_width-2*margin.bottom)
        //     .attr("fill", "#f6f6f6")
        //     // .attr('stroke', '#000000')
        //     .lower();


        let group = svg.append('g')
            .attr('class', `heatmap_unit`)
            .attr('transform', d=>`translate(${width/2},${width/2})`)
            .datum(unit_data)



        let colorScale_inner = d3.scaleOrdinal()
            .domain(['positive_digit_1', 'positive_digit_0', 'negative_digit_1','negative_digit_0'])
            .range(['transparent','#2688F0','#E6078D', 'transparent'])


        /*画内部的扇形*/
        group
            .selectAll('.null')
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states

                let diff = (bs_0+bs_1+bs_2+bs_3) - (bs_4+bs_5+bs_6+bs_7)

                let arr = []
                // console.log(diff)
                if(diff>=0){
                    arr = [
                        // {key: 'digit_1', value: Math.abs(diff)},
                        // {key: 'digit_0', value: 1-Math.abs(diff)}
                        {key: 'positive_digit_1', value: 1-diff},
                        {key: 'positive_digit_0', value: diff}
                    ]
                }else{
                    arr = [
                        {key: 'negative_digit_1', value: Math.abs(diff)},
                        {key: 'negative_digit_0', value: 1-Math.abs(diff)}
                    ]
                }

                return d3.pie()
                    .value(d=>d.value).sort(null).padAngle(0.1)
                    (arr)
            })
            .enter().append('path')
            .attr('d', d3.arc()
                .innerRadius(0)  // This will create the donut hole
                .outerRadius(unfolded_donutRadius*0.25)
                .cornerRadius(1)
            )
            .attr('fill', d=>colorScale_inner(d.data.key))



        let colorScale_outer = d3.scaleOrdinal()
            .domain(['digit_0', 'digit_1'])
            .range(['#98c3ec','#f3bfbf'])

        /*画外环*/
        group
            .selectAll('.null')
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states


                return d3.pie()
                    .value(d=>d.value).sort(null).padAngle(0.05)
                    ([
                        {key: 'digit_1', value: bs_7},
                        {key: 'digit_1', value: bs_6},
                        {key: 'digit_1', value: bs_5},
                        {key: 'digit_1', value: bs_4},
                        {key: 'digit_0', value: bs_3},
                        {key: 'digit_0', value: bs_2},
                        {key: 'digit_0', value: bs_1},
                        {key: 'digit_0', value: bs_0},
                    ])
            })
            .join('path')
            .attr('d', d3.arc()
                .innerRadius(unfolded_donutRadius * 0.32)  // This will create the donut hole
                .outerRadius(unfolded_donutRadius * 0.4))
            .attr('fill', (d,i)=>colorScale_outer(d.data.key))
            // .attr("stroke", "#494949")  // this sets the stroke color to white
            .attr("stroke-width", "1")



        let colorScale_innerRing = d3.scaleOrdinal()
            .domain(['transparent', 'key_0', 'key_1'])
            .range(['transparent','#2688F0','#E6078D'])


        /*画作差的环*/
        group
            .selectAll('.null')
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states

                let diff = (bs_0+bs_1+bs_2+bs_3) - (bs_4+bs_5+bs_6+bs_7)


                let digit_0 = bs_0+bs_1+bs_2+bs_3
                let digit_1 = bs_4+bs_5+bs_6+bs_7
                let rest = 1 - (digit_0+digit_1)

                let arr = []

                if(diff>=0){
                    arr = [
                        {key: 'transparent', value: digit_1},
                        {key: 'key_1', value: digit_1},
                        {key: 'transparent', value: digit_0 - digit_1}
                    ]
                }else if(diff<0){
                    arr = [
                        {key: 'transparent', value: digit_1 - digit_0},
                        {key: 'key_0', value: digit_0},
                        {key: 'transparent', value: digit_0}
                    ]
                }


                return d3.pie()
                    .value(d=>d.value).sort(null).padAngle(0.1)
                    (arr)
            })
            .enter().append('path')
            .attr('d', d3.arc()
                .innerRadius(unfolded_donutRadius*0.21)  // This will create the donut hole
                .outerRadius(unfolded_donutRadius*0.25)
                .cornerRadius(1))
            .attr('fill', d=>colorScale_innerRing(d.data.key))


        /*添加环外的label*/
        group.selectAll("text")
            .data(d=>{
                // console.log('d',d)

                let {bs_0, bs_1, bs_2, bs_3, bs_4, bs_5, bs_6, bs_7} = d.states


                return d3.pie()
                    .value(d=>d.value).sort(null).padAngle(0.05)
                    ([
                        {label: '111', value: bs_7},
                        {label: '110', value: bs_6},
                        {label: '101', value: bs_5},
                        {label: '100', value: bs_4},
                        {label: '011', value: bs_3},
                        {label: '010', value: bs_2},
                        {label: '001', value: bs_1},
                        {label: '000', value: bs_0},
                    ])
            })
            .enter()
            .append("text")
            .text(d => d.data.label)
            .attr("transform", d => {

                const c = d3.arc()
                    .innerRadius(unfolded_donutRadius * 0.32)  // This will create the donut hole
                    .outerRadius(unfolded_donutRadius * 0.4).centroid(d);
                const x = c[0];
                const y = c[1];
                const h = Math.sqrt(x*x + y*y);  // Pythagoras theorem to find the length of the centroid vector
                return `translate(${(x/h * unfolded_donutRadius * 0.5)}, ${(y/h * unfolded_donutRadius * 0.5)+5})`; // Multiply the normalized centroid vector by the labelRadius
            })
            .style("text-anchor", "middle")
            .style("fill", "#000000")
            .style('font-size', d=>{
                if(d.value<=0.05) return 0
                return '0.8em'
            })


        /*显示数据*/
        group.append('text')
            .attr("transform", `translate(${-width/2+65},${-width/2+12})`)
            .style("text-anchor", "middle")
            .style("fill", "#000000")
            .style('font-size', '0.9em')
            .text(`x1=${unit_data.feature[0].toFixed(2)} x2=${unit_data.feature[1].toFixed(2)}`)




    }




function render_view(epoch){


    axios.get(`database/heatmap/data_moons/heatmap.json`)
        // axios.get(`data/temp.json`)
        .then(res => {
            render_heatmap(res.data, epoch)

        })
        .then(()=>{
            axios.get(`database/datasets/data_moons/train.json`)
                // axios.get(`data/temp.json`)
                .then(res => {

                    // render_train(res.data)
                })
        })
        .then(()=>{
            axios.get(`database/datasets/data_moons/valid.json`)
                // axios.get(`data/temp.json`)
                .then(res => {

                    render_valid(res.data)
                })
        })



}



    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        render_view(epoch)




    }, [])





    // 当 algo 更新的时候update
    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }



        d3.select(".svg_heatmap").selectAll('*').remove()

        render_view(epoch)



    }, [epoch])


    return (

        <div className={'heatmap_container'}
            style={{
            'width':view_width,
            'height':view_height,
            'top': position_top,
            'left': position_left,
            'position': "absolute",
            // 'border':'solid 1px #000000'
        }}>
            <svg className={'svg_heatmap'}
                width={width_svg}
                height={width_svg+legend_height}></svg>
        </div>
    )



}


export default Heatmap


