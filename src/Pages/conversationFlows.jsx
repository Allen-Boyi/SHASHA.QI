import React, { Component } from 'react'

function ConversationFlows({ isMobile }) {
     const placeholderStyle = { 
    padding: isMobile ? '10px' : '20px', 
    color: '#333',
    fontFamily: 'sans-serif' 
  };
    return (
      <div>
        <h1 style={placeholderStyle}>Conversation Flows</h1>
        <p>This is the Conversation Flows page.You are welcomed to our platform.This page is still under development.</p>
        <small>you can check out our settings page for more information.</small>
      </div>
    )
  }


export default ConversationFlows