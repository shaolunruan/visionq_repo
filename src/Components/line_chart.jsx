import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import axios from 'axios'

function Line_chart(props) {


    const didMount = useRef(false)


    const {system_width, system_height} = props.config
    const {view_lineChart_width, view_lineChart_height, view_lineChart_top, view_lineChart_left} = props.config




    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_lineChart_width
    const view_height = system_height * +view_lineChart_height
    const position_top = system_height * +view_lineChart_top
    const position_left = system_width * +view_lineChart_left


    let verticalLineLoss, verticalLineAcc;


    
    //定义是否mount的ref
    // const didMount = useRef(false)




    function render_lineChart_loss(data){

        const svg = d3.select(".svg_lineChart");

        const margin = { top: 20, right: 30, bottom: 10, left:15 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") / 2 - margin.top - margin.bottom;

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('class', 'line_chart')

        // console.log(d3.extent(Object.values(data).map(d=>d['loss'])))

        const x = d3.scaleLinear()
            .domain([1, 100])
            .range([0, width])


        const y = d3.scaleLinear()
            .domain([d3.min(Object.values(data).map(d=>d['loss']))-0.02, d3.max(Object.values(data).map(d=>d['loss']))+0.02])
            .range([height, 0])


        const line = d3.line()
            .x(d => x(d.epoch))
            .y(d => y(d.loss));

        g.append("path")
            .datum(Object.entries(data).map(([key, value]) => ({ epoch: parseInt(key.split('_')[1]), loss: value.loss })))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .on('mouseover', function(d,e,i){
                console.log(d3.select(this).data(), d,e,i)

            })

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(11).tickSize(4));

        g.append("g")
            .attr("transform", "translate(" + width + ", 0)")
            .call(d3.axisRight(y).ticks(6).tickSize(4));
        //
        // g.append("text")
        //     .attr("transform", "translate(" + (15) + "," + (height + margin.top + 3) + ")")
        //     .style("text-anchor", "middle")
        //     .style('font-size', '0.8em')
        //     .text("epoch");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + margin.right-17)
            .attr("x", -(height / 2))
            .attr("dy", "-1.5em")
            .style("text-anchor", "middle")
            .style('font-size', '0.8em')
            .text("loss");

// Inside both render_lineChart_loss and render_lineChart_acc functions
        g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#ecf4fc")
            .on("mousemove", function(event) {
                // Get the x position of the cursor relative to the SVG
                const mouseX = d3.pointer(event)[0];

                // Update the x position of the vertical lines on both charts
                verticalLineLoss.attr("x1", mouseX).attr("x2", mouseX);
                verticalLineAcc.attr("x1", mouseX).attr("x2", mouseX);
            })
            .on("mouseover", function() {
                // Show the vertical lines on both charts
                verticalLineLoss.attr("opacity", 1);
                verticalLineAcc.attr("opacity", 1);

            })
            .on("mouseout", function() {
                // Hide the vertical lines on both charts
                verticalLineLoss.attr("opacity", 0);
                verticalLineAcc.attr("opacity", 0);
            })
            .lower();


        verticalLineLoss = g.append("line")
            .attr("stroke", "red")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("opacity", 0);  // Initially set to hidden



    }


    function render_lineChart_acc(data){

        const svg = d3.select(".svg_lineChart");

        const margin = { top: 20, right: 30, bottom: 10, left:15 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") / 2 - margin.top - margin.bottom;

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top+80})`)
            .attr('class', 'line_chart')


        const x = d3.scaleLinear()
            .domain([1, 100])
            .range([0, width])


        const y = d3.scaleLinear()
            .domain([d3.min(Object.values(data).map(d=>d['acc']))-0.02, d3.max(Object.values(data).map(d=>d['acc']))+0.02])
            .range([height, 0])


        const line = d3.line()
            .x(d => x(d.epoch))
            .y(d => y(d.acc));

        g.append("path")
            .datum(Object.entries(data).map(([key, value]) => ({ epoch: parseInt(key.split('_')[1]), acc: value.acc })))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(11).tickSize(4));

        g.append("g")
            .attr("transform", "translate(" + width + ", 0)")
            .call(d3.axisRight(y).ticks(6).tickSize(4));

        g.append("text")
            .attr("transform", "translate(" + (15) + "," + (height + margin.top + 3) + ")")
            .style("text-anchor", "middle")
            .style('font-size', '0.8em')
            .text("epoch");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + margin.right-17)
            .attr("x", -(height / 2))
            .attr("dy", "-1.5em")
            .style("text-anchor", "middle")
            .style('font-size', '0.8em')
            .text("acc");



// Inside both render_lineChart_loss and render_lineChart_acc functions
        g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#ecf4fc")
            .on("mousemove", function(event) {
                // Get the x position of the cursor relative to the SVG
                const mouseX = d3.pointer(event)[0];

                // Update the x position of the vertical lines on both charts
                verticalLineLoss.attr("x1", mouseX).attr("x2", mouseX);
                verticalLineAcc.attr("x1", mouseX).attr("x2", mouseX);
            })
            .on("mouseover", function() {
                // Show the vertical lines on both charts
                verticalLineLoss.attr("opacity", 1);
                verticalLineAcc.attr("opacity", 1);
            })
            .on("mouseout", function() {
                // Hide the vertical lines on both charts
                verticalLineLoss.attr("opacity", 0);
                verticalLineAcc.attr("opacity", 0);
            })
            .lower();


// Inside render_lineChart_acc
        verticalLineAcc = g.append("line")
            .attr("stroke", "red")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("opacity", 0);  // Initially set to hidden



    }










    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        axios.get(`database/loss_acc/data_moons/loss_acc.json`)
            // axios.get(`data/temp.json`)
            .then(res => {

                render_lineChart_loss(res.data)
                render_lineChart_acc(res.data)
            })

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
            <svg className={'svg_lineChart'}
                 width={view_width}
                 height={view_height}
                 style={{'position': "absolute", 'top': position_top, 'left': position_left}}></svg>

        </div>
    )



}


export default Line_chart