import React, { useState, useEffect, useRef  } from 'react';

function Main(props) {


    const param_algo = props.param_algo



    //定义是否mount的ref
    const didMount = useRef(false)

    // 数据存这儿
    let data = useRef({})


    function render_view(){

    }






    //////////////////////////////////////////////

    // mount 的时候渲染一次
    useEffect(() => {

        render_view()

    }, [])





    // 当 algo 更新的时候update
    useEffect(()=>{

        // 跳过第一次 mount
        if(!didMount.current){
            didMount.current = true

            return
        }


    }, [param_algo])


    return (
        <div>
            123
        </div>
    )



}


export default Main