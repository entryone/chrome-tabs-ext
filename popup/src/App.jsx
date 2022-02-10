import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Button from '@mui/material/Button'
import { useState, useEffect } from 'react'
import './App.css'
import { closeProhibited, extractHostname } from '../../common/background'

function App() {
  const [hostName, setCurrentHostName] = useState('')

  useEffect(() => {
    chrome.tabs.getSelected(null, function(tab) {
      setCurrentHostName(tab.url)
    });
  }, [])

  const onChange = e => {
    setSites(e.target.value)
  }

  const onAdd= () => {
    chrome.storage.sync.get('prohibitedSites', function(data) {
      chrome.tabs.getSelected(null, function(tab) {
        const sites = data.prohibitedSites + '\n' + extractHostname(tab.url)
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
        <Button variant="outlined" onClick={onAdd} >Block {extractHostname(hostName)}</Button>
        <Button variant="outlined" onClick={onGiveMeMinute} >Give me a minute</Button>
    </div>
  )
}

export default App
