'use strict';

function log (text) {
  var paragraph = document.getElementById("log");
  var textNode = document.createTextNode(text);
  paragraph.appendChild(textNode);
}

function constructOptions() {

  const saveButton = document.getElementById("save")
  const sites = document.getElementById("prohibitedSites")

  chrome.storage.sync.get('prohibitedSites', function(data) {
    sites.value = data.prohibitedSites || '';
  });

  saveButton.addEventListener('click',() => {
    chrome.storage.sync.set({prohibitedSites: sites.value}, function() {
      //log('set');
    })
  })
}
constructOptions();
