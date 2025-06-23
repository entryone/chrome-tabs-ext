import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Button from '@mui/material/Button'
import { useState, useEffect } from 'react'
import './App.css'
//import { closeProhibited, extractHostname } from '../../common/background'

function App() {
  const [hostName, setCurrentHostName] = useState('')

  useEffect(() => {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      setCurrentHostName(tabs[0].url)
    });
  }, [])

  const onChange = e => {
    setSites(e.target.value)
  }

  const onAdd= () => {
    chrome.storage.sync.get('prohibitedSites', function(data) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        const sites = data.prohibitedSites + '\n' + extractHostname(tabs[0].url)
        chrome.storage.sync.set({prohibitedSites: sites}, () => {
          closeProhibited()
        })
      });
    });
  }

  const onGiveMeMinute = () => {
    chrome.storage.sync.set({givenMinuteTime: Date.now().toString()}, () => {

    })
  }

  return (
    <div className="App">
        <Button variant="outlined" onClick={onAdd} >Block {extractHostname(hostName || '')}</Button>
        <Button variant="outlined" onClick={onGiveMeMinute} >Give me a minute</Button>
    </div>
  )
}

export default App


function extractHostname(url) {
  var hostname;
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}

function closeProhibited () {
  chrome.storage.sync.get('prohibitedSites', function(data) {
    chrome.storage.sync.get('givenMinuteTime', function(time) {

      if (time.givenMinuteTime) {
        const now = new Date()
        const givenTime =  new Date(parseInt(time.givenMinuteTime)).getTime()
        const seconds = (now.getTime() - givenTime) / 1000
        if (seconds < 60) {
          clearTimeout(closeTimeout)
          closeTimeout = setTimeout(closeProhibited, (60 - seconds) * 1000 - 10)
          return
        }
      }
      const prohibited = (data.prohibitedSites || '').split(/\n/)
      const doClose = tab => {
        const hostName = extractHostname(tab.url)
        const url = new URL(tab.url)
        const isProhibited = !!prohibited.filter(host => host.trim() !== '').find(prohibitedHost => (hostName === prohibitedHost.trim() || hostName === 'www.' + prohibitedHost.trim() ))
        if (isProhibited) {
          redirectToBlockerWebsite(tab)
        }
      }
      iterateAllTabs(doClose)
    });
  });
}

function iterateAllTabs  (onTab) {
  chrome.windows.getAll({populate:true},function(windows){
    windows.forEach(function(window){
      window.tabs.forEach(function(tab){
        onTab(tab)

      });
    });
  });
}

function redirectToBlockerWebsite(tab)  {
  chrome.storage.sync.get('redirectUrl', function(data) {
    chrome.tabs.update(tab.id, { url: data.redirectUrl });
  });
}
