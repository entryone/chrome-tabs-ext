'use strict';

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
