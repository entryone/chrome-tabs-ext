'use strict';

let doButton = document.getElementById('doButton');

doButton.onclick = () => {
  closeSuspended()
  closeEmpty()
  closeProhibited({close: true})
}
