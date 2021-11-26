
const iterateAllTabs = onTab => {
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

const redirectToBlockerWebsite = () => {
  chrome.tabs.update(undefined, { url: 'https://todoist.com/app/upcoming' });
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


const closeProhibited = ({close = false} = {}) => {
  chrome.storage.sync.get('prohibitedSites', function(data) {
    const prohibited = data.prohibitedSites.split(/\n/)
    const doClose = tab => {
      const hostName = extractHostname(tab.url)
      const isProhibited = !!prohibited.find(prohibitedHost => ( hostName === prohibitedHost.trim() || hostName === 'www.' + prohibitedHost.trim() ))
      if (isProhibited) {
        !close && redirectToBlockerWebsite()// writeBlockerMessage(tab.id)
        close && chrome.tabs.remove(tab.id)
      }
    }
    iterateAllTabs(doClose)
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
