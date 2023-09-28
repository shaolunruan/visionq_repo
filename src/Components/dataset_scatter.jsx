import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import axios from 'axios'

function Data_scatter(props) {

    const didMount = useRef(false)

    // parameters
    const setDataPoint = props.setDataPoint
    let data_point = props.datapoint





    const {system_width, system_height} = props.config
    const {view_dataScatter_width, view_dataScatter_height, view_dataScatter_top, view_dataScatter_left} = props.config



    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_dataScatter_width
    const view_height = system_height * +view_dataScatter_height
    const position_top = system_height * +view_dataScatter_top
    const position_left = system_width * +view_dataScatter_left



    //定义是否mount的ref
    // const didMount = useRef(false)




    function render_view(data){


        const dataset = Object.entries(data);

        // console.log(dataset)

        const svg = d3.select(".svg_datasetScatter");
        const svg_width = +svg.attr("width")
        const svg_height = +svg.attr("height")
        const axis_width = 30
        const axis_height = 30
        const width = svg_width-axis_width;
        const height = svg_height-axis_height;

        let r = 5, enlarge_r = 8



        const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);
        const colorScale = d3.scaleOrdinal().domain([-1, 1]).range(["#E6078D", "#2688F0"]);


        const xAxis = d3.axisBottom(xScale).ticks(8).tickSize(4)  // Here, 5 is a suggestion; D3 might use a different number that's close.
        const yAxis = d3.axisRight(yScale).ticks(8).tickSize(4)

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#e2eef8")
            // .attr('stroke', '#000000')
            .lower();


        let group = svg.append('g')
            .attr('class', 'datasetScatter')
            .attr("transform", `translate(${5},${5})`)



        group.append("g")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

        group.append("g")
            .attr("transform", "translate(" + (width) + ",0)")
            .call(yAxis);



        group.selectAll("circle")
            .data(dataset)
            .enter().append("circle")
            .attr("class", d=>`circle_${d[0]}`)
            .attr("cx", d => xScale(d[1].data[0]))
            .attr("cy", d => yScale(d[1].data[1]))
            .attr("r", r)
            .attr("fill", d => colorScale(d[1].target))
            .attr("stroke", "#f5f5f5")
            .style('cursor','pointer')
            .on('click', function(){


                setDataPoint(d3.select(this).data()[0][0])
            })


        // 对默认的datapoint做效果
        d3.select(`.circle_${data_point}`).attr('r', 8).attr('stroke', '#ffc20f').attr('stroke-width', 3)
            .attr('id', 'selected')


        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0) // Initialize as invisible
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "1px solid black")
            .style("border-radius", "3px");






        /*画legend*/

        let legend = svg.append('g')
            .attr('transform', `translate(${0},${width})`)

        let legend_arr = [{'label': 'class A', 'color': '#2688F0'},
            {'label': 'class B', 'color': '#E6078D'}]

        legend_arr.forEach((item, i) => {

            const gap_width = width/legend_arr.length

            const legendItem = legend.append("g")
                .attr("transform", `translate(${i*gap_width+20},${-35})`);

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



        // This will append the lines when hovering over the points
        function handleMouseOver(d, i) {
            // Vertical line
            group.append("line")
                .attr("class", "hover-line")
                .attr("x1", d=>{
                    return xScale(d3.select(this).data()[0][1]['data'][0])
                })
                .attr("x2", d=>{
                    return xScale(d3.select(this).data()[0][1]['data'][0])
                })
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4"); // This makes it a dashed line, you can remove this line for a solid line

            // Horizontal line
            group.append("line")
                .attr("y1", d=>{
                    return yScale(d3.select(this).data()[0][1]['data'][1])
                })
                .attr("y2", d=>{
                    return yScale(d3.select(this).data()[0][1]['data'][1])
                })
                .attr("x1", 0)
                .attr("x2", width)
                .attr("class", "hover-line")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4");


            tooltip.transition()
                .duration(600)
                .style("opacity", 0.9);

            tooltip.html(d3.select(this).data()[0][0]+"<br>"+"x1: " + d3.select(this).data()[0][1]['data'][0].toFixed(2) + "<br>x2: " + d3.select(this).data()[0][1]['data'][1].toFixed(2))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");


            let enlarge_circle = d3.select(this)
            enlarge_circle.raise()


            enlarge_circle.transition()             // Start a transition
                .duration(200)
                .attr("r", enlarge_r)




        }

// This will remove the lines and revert circle size when not hovering
        function handleMouseOut(d, i) {
            group.selectAll(".hover-line").remove();

            tooltip.transition()
                .duration(500)
                .style("opacity", 0)



            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", r)

            tooltip.style("left", "0px")
                .style("top","0px")
        }

// Add the mouseover and mouseout events to the circles
        group.selectAll("circle")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

    }






    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        axios.get(`database/datasets/data_moons/train.json`)
            // axios.get(`data/temp.json`)
            .then(res => {

                render_view(res.data)
            })

    }, [])





    // 当 algo 更新的时候update
    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }


        d3.select('#selected').attr('r', 5).attr('stroke', '#ffffff').attr('stroke-width', 1)
            .attr('id', '')

        // console.log(data_point)
        // console.log(`.circle_${data_point}`)
        d3.select(`.circle_${data_point}`).attr('r', 8).attr('stroke', '#ffc20f').attr('stroke-width', 3)
            .attr('id', 'selected')



    }, [data_point])


    return (

        <div>
            <svg className={'svg_datasetScatter'}
                 width={view_width}
                 height={view_height}
                style={{'position': "absolute", 'top': position_top, 'left': position_left}}></svg>

        </div>
    )



}


export default Data_scatter