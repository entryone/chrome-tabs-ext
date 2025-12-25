import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import BlockIcon from '@mui/icons-material/Block'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SettingsIcon from '@mui/icons-material/Settings'
import { useState, useEffect } from 'react'
import './App.css'

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

  const onAdd = () => {
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
      // Можно показать уведомление об успехе
    })
  }

  const onOpenSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const currentHost = extractHostname(hostName || '')

  return (
    <div className="App">
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', padding: 0 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={onAdd}>
            <ListItemIcon>
              <BlockIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Block Site" 
              secondary={currentHost ? currentHost : 'No site detected'} 
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={onGiveMeMinute}>
            <ListItemIcon>
              <AccessTimeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Give me a minute" 
              secondary="Temporarily disable blocking" 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={onOpenSettings}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              secondary="Configure blocked sites" 
            />
          </ListItemButton>
        </ListItem>
      </List>
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

