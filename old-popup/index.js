'use strict';
import React from 'react'
import ReactDom from 'react-dom'

//let doButton = document.getElementById('doButton');


//doButton.onclick = () => {
//  closeSuspended()
//  closeEmpty()
//  closeProhibited({close: true})
//}



document.addEventListener("DOMContentLoaded", function() {
  let loginButton = document.getElementById('loginButton');
  loginButton.onclick = () => {
    login()
  }
});

console.error('app', document.getElementById('app'))

React.render(<p>Hello</p>, document.getElementById('app'))
