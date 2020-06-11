
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

const closeProhibited = () => {

  chrome.storage.sync.get('prohibitedSites', function(data) {
    const prohibited = data.prohibitedSites.split(/\n/)
    const close = tab => {
      const hostName = extractHostname(tab.url)
      const isProhibited = !!prohibited.find(prohibitedHost => ( hostName === prohibitedHost.trim() || hostName === 'www.' + prohibitedHost.trim() ))
      isProhibited && chrome.tabs.remove(tab.id)
    }
    iterateAllTabs(close)
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
