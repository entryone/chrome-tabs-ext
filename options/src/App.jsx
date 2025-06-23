import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sites, setSites] = useState('')
    const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    chrome.storage.sync.get('prohibitedSites', function(data) {
      setSites(data.prohibitedSites || '')
    });
      chrome.storage.sync.get('redirectUrl', function(data) {
          setRedirectUrl(data.redirectUrl || '')
      });
  }, [])

  const onChange = e => {
    setSites(e.target.value)
  }

    const onChangeUrl = e => {
        setRedirectUrl(e.target.value)
    }

  const onSave = () => {
    chrome.storage.sync.set({prohibitedSites: sites, redirectUrl: redirectUrl}, function() {
      //log('set');
    })

  }

  return (
      <div className="App">
          <textarea onChange={onChange} id="prohibitedSites" value={sites}/>
          <br/>
          <br/>
          <input value={redirectUrl} onChange={onChangeUrl} id="redirectUrl"/>
          <br/>
          <br/>
          <button id="save" onClick={onSave}>Save</button>
      </div>
  )
}

export default App
