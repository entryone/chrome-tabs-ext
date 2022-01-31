import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sites, setSites] = useState('')

  useEffect(() => {
    chrome.storage.sync.get('prohibitedSites', function(data) {
      setSites(data.prohibitedSites || '')
    });
  }, [])

  const onChange = e => {
    setSites(e.target.value)
  }

  const onSave = () => {
    chrome.storage.sync.set({prohibitedSites: sites}, function() {
      //log('set');
    })
  }

  return (
    <div className="App">
      Hello world
    </div>
  )
}

export default App
