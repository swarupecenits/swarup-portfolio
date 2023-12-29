import React, { useEffect } from 'react'
import {preLoaderAnim} from "../../animations/index"
import "./Preloader.css"

const Preloader = () => {

    useEffect(()=>{
        preLoaderAnim()
    },[])
  return (
    <div className='preloader'>
      <div className="texts-container">
      <span>Swarup</span>
      <span>Chanda</span>
      <span>Portfolio</span>
      </div>
    </div>
  )
}

export default Preloader
