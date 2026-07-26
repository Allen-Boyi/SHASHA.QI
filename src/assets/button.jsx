import{useEffects,useState} from 'react'
import React from 'react'
function Button({ label = 'Click Me', onClick }) {
  return (
    <div>
      <button 
        onClick={onClick}
        className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition shadow-md'
      >
        {label}
      </button>
    </div>
  )
}

export default Button