import {updateRules} from '../common/common'

/*chrome.runtime.onInstalled.addListener(function() {
  //console.error('on installed')
  closeProhibited()
});*/



chrome.tabs.onUpdated.addListener( (ev, ff, tab) => {
  //console.error('on update', tab.url)
  //closeProhibited()
})

chrome.tabs.onCreated.addListener( () => {
  //console.error('on create')
  //closeProhibited()
})

chrome.runtime.onInstalled.addListener(() => {
  updateRules()
});



function iterateAllTabs  (onTab) {
  chrome.windows.getAll({populate:true},function(windows){
    windows.forEach(function(window){
      window.tabs.forEach(function(tab){
        onTab(tab)

      });
    });
  });
}

const suspendedURL = 'chrome-extension://klbibkeccnjlkjkiokjodocebajanakg'

const closeSuspended = () => {
  const close = tab => {
    if (tab.url.indexOf(suspendedURL) > -1) chrome.tabs.remove(tab.id)
  }
  iterateAllTabs(close)
}

const emptyTabUrl = 'chrome://newtab'

const closeEmpty = () => {
  const close = tab => {
    if (tab.url.indexOf(emptyTabUrl) > -1) chrome.tabs.remove(tab.id)
  }
  iterateAllTabs(close)
}

function redirectToBlockerWebsite(tab)  {
  chrome.storage.sync.get('redirectUrl', function(data) {
    //setRedirectUrl(data.redirectUrl || '')
    chrome.tabs.update(tab.id, { url: data.redirectUrl });
  });

}

const writeBlockerMessage = (tabId) => {
  const url = chrome.extension.getURL('images/stay-focused.jpg');
  const image = '<img height="300" src="' + url + '" />'
  const execute = code => chrome.tabs.executeScript(tabId, {code})
  execute('document.body.style.textAlign = "center"')
  execute('document.body.style.backgroundColor = "#FFF"')
  execute('document.body.style.overflow = "hidden"')
  execute('document.body.style.marginTop = "300px"')
  execute('document.body.innerHTML = \'' + image + '\'')
  execute('document.body.className = ""')
  //execute('document.head.innerHTML = "<title>Stay Focused</title>"')
  execute('document.head.innerHTML = ""')
}

let closeTimeout

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
        //const url = new URL(tab.url)
        const isProhibited = !!prohibited.filter(host => host.trim() !== '').find(prohibitedHost => (hostName === prohibitedHost.trim() || hostName === 'www.' + prohibitedHost.trim() ))
        if (isProhibited) {
          redirectToBlockerWebsite(tab)
        }
      }
      iterateAllTabs(doClose)
    });
  });
}


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
