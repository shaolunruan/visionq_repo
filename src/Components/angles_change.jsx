import React, { useState, useEffect, useRef  } from 'react';
import * as d3 from 'd3'
import * as fisheye from "d3-fisheye";
import axios from 'axios'
import {circular} from "d3-fisheye";

function Angles_change(props) {


    const {system_width, system_height} = props.config
    const {view_anglesChange_width, view_anglesChange_height, view_anglesChange_top, view_anglesChange_left} = props.config





    // 定义一些位置大小的parameter参数
    const view_width = system_width * +view_anglesChange_width
    const view_height = system_height * +view_anglesChange_height
    const position_top = system_height * +view_anglesChange_top
    const position_left = system_width * +view_anglesChange_left

    const gateColors = {
        'rx': '#289D76',
        'rz': '#e06c82',
        'ry': '#7763c0',
        'cx': '#645e73',
        'measure': '#287e9d'
    };



    // Create a tooltip <div> element and style it
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('display', 'none')
        .style('position', 'absolute')
        .style('background', 'white')
        .style('border', '1px solid #ccc')
        .style('padding', '8px')
        .style('border-radius', '5px');

    // Helper function to display the tooltip
// Helper function to display the tooltip
    const showTooltip = (event, angleName, color, data) => {
        const [x, y] = [event.clientX, event.clientY];
        const index = Object.keys(data.epoch_1.angles).indexOf(angleName); // Get the index of the angle
        const capitalizedAngle = angleName.substring(0, 2).toUpperCase();
        const tooltipText = `${capitalizedAngle}(θ${index})`;



        tooltip.style('display', 'block')
            .style('opacity', 0.9)
            .style('left', x + 10 + 'px') // Adjust position for better visibility
            .style('top', y + 'px')
            .html(`
      <div>
        <svg width="16" height="16" style="display: inline-block;"> 
          <circle cx="8" cy="8" r="6" fill="${gateColors[angleName.replace(/[^a-z]/gi, '')]}"></circle>
        </svg>
        <span style="margin-left: 5px;">${tooltipText}, epoch0: ${data['epoch_1']['angles'][angleName]}</span>
      </div>
    `);
    };


    // Helper function to hide the tooltip
    const hideTooltip = () => {
        tooltip.style('display', 'none');
    };

    // ... (rest of the code remains the same)






    function render_view(data) {
        const svg = d3.select(".svg_anglesChange");
        const margin = { top: 40, right: 40, bottom: 20, left: 10 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
        const group = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Extract variable names (e.g., rz00, rz10, ...) from the data
        const variables = Object.keys(data.epoch_1.angles);

        // Define color scale for different variables
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // Define x and y scales
        const x = d3.scaleLinear()
            .domain([1, Object.keys(data).length]) // Assuming epochs are consecutive integers
            .range([0, width]);

        const maxDifference = d3.max(Object.values(data).map(d => {
            const epoch0Values = Object.values(d.angles);
            const currentValues = Object.values(data.epoch_1.angles);
            return d3.max(epoch0Values.map((value, i) => value - currentValues[i]));
        }));

        const y = d3.scaleLinear()
            .domain([-maxDifference - 0.2, maxDifference]) // Full range of data values
            .range([height, 0]);

        // Define a line generator
        const line = d3.line()
            .x((d, i) => x(i + 1)) // x-coordinate based on the epoch number
            .y(d => y(d));

        // Iterate through variables and draw a line for each
        // Inside the render_view function, attach event listeners to the lines
        variables.forEach((variable) => {
            group.append('path')
                .datum(Object.values(data).map((d) => d.angles[variable] - data.epoch_1.angles[variable]))
                .attr('fill', 'none')
                .attr('stroke', d=>{
                    let gateName = variable.replace(/[^a-z]/gi, '')
                    return gateColors[gateName]
                })
                .attr('stroke-width', 1.5)
                .attr('class', 'lines')
                .attr('d', line)
                .on('mouseover', function(event){
                    // Show tooltip when hovering over the line
                    d3.select(this)
                        .transition()
                        .duration(100) // 200 milliseconds transition
                        .attr('stroke-width', 4);


                    showTooltip(event, variable, color(variable), data);
                })
                .on('mouseout', function() {
                    // Hide tooltip when mouse leaves the line
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('stroke-width', 1.5);


                    hideTooltip();
                });
        });

        // Add x-axis
        group.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10).tickSize(4));

        // Add y-axis
        group.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(y).ticks(7).tickSize(2));

        // Label for the x-axis
        group.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.top -10)
            .attr("text-anchor", "middle")
            .style('font-size', '0.7em')
            .text("Epoch");

        // Label for the y-axis
        group.append("text")
            .attr("transform", `translate(${width+35}, ${height/2}) rotate(90)`)
            .attr("dy", "1em")
            .style('font-size', '0.7em')
            .attr("text-anchor", "middle")
            .text("Changes of angles");

// Legend
        const legend = group.append("g")
            .attr("transform", `translate(${-10}, ${-35})`); // Adjust vertical position

        const gateNames = Object.keys(data.epoch_1.angles).reduce((arr,item)=>{
            let gate = item.replace(/[^a-z]/gi, '')
            if(!arr.includes(gate)){
                arr.push(gate)
                return arr
            }

            return arr
        },[])


        gateNames.forEach((gateName, i) => {

            const gap_width = width/gateNames.length

            const legendItem = legend.append("g")
                .attr("transform", `translate(${i*gap_width+10},${12})`);

            legendItem.append("circle") // Add circles for legend
                .attr("cx", 10)
                .attr("cy", 10)
                .attr("r", 4)
                .attr("fill", gateColors[gateName]);

            // Create a text element for legend
            const gateText = legendItem
                .append("text")
                .attr("x", 17)
                .attr("y", 10)
                .attr("dy", ".35em");

            // Add "θ" without bold styling
            gateText.append("tspan")
                .text(`${gateName.toUpperCase()} gates`)
                .attr("font-size", "0.9em");


        });





    }








    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        axios.get(`database/angles/data_moons/angles.json`)
            // axios.get(`data/temp.json`)
            .then(res => {

                render_view(res.data)
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
            <svg className={'svg_anglesChange'}
                 width={view_width}
                 height={view_height}
                 style={{'position': "absolute", 'top': position_top, 'left': position_left,
                     // 'background':'#f0f0f0'
            }}></svg>

        </div>
    )



}


export default Angles_change


