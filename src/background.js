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
  updateIcon()
});

// Функция для создания иконки через Canvas
function createIconImageData(size, color) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Очищаем canvas
  ctx.clearRect(0, 0, size, size);
  
  if (color === 'red') {
    // Красная иконка - крестик в рамке
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = Math.max(2, size / 20);
    
    // Рамка
    const padding = size / 8;
    const rectSize = size - padding * 2;
    ctx.strokeRect(padding, padding, rectSize, rectSize);
    
    // Крестик
    const crossPadding = size / 4;
    ctx.beginPath();
    ctx.moveTo(crossPadding, crossPadding);
    ctx.lineTo(size - crossPadding, size - crossPadding);
    ctx.moveTo(size - crossPadding, crossPadding);
    ctx.lineTo(crossPadding, size - crossPadding);
    ctx.stroke();
  } else {
    // Зеленая иконка - галочка в круге (увеличенная)
    ctx.fillStyle = '#388e3c';
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth = Math.max(2, size / 20);
    
    // Круг (больше - используем 40% размера вместо 25%)
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4; // Увеличено с 0.25 до 0.4
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Галочка (больше)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, size / 12); // Увеличена толщина линии
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    // Увеличенные координаты галочки
    ctx.moveTo(centerX - radius * 0.5, centerY);
    ctx.lineTo(centerX - radius * 0.1, centerY + radius * 0.4);
    ctx.lineTo(centerX + radius * 0.5, centerY - radius * 0.3);
    ctx.stroke();
  }
  
  return ctx.getImageData(0, 0, size, size);
}

// Функция для обновления иконки в зависимости от состояния блокировки
function updateIcon() {
  chrome.storage.sync.get('givenMinuteTime', function(time) {
    const isBlockingActive = !isBlockingPaused(time.givenMinuteTime);
    const color = isBlockingActive ? 'red' : 'green';
    
    // Создаем иконки разных размеров
    const imageData = {
      16: createIconImageData(16, color),
      32: createIconImageData(32, color),
      48: createIconImageData(48, color),
      128: createIconImageData(128, color)
    };
    
    chrome.action.setIcon({ imageData: imageData });
  });
}

// Проверка, активна ли пауза блокировки
function isBlockingPaused(givenMinuteTime) {
  if (!givenMinuteTime) {
    return false;
  }
  const now = new Date();
  const givenTime = new Date(parseInt(givenMinuteTime)).getTime();
  const seconds = (now.getTime() - givenTime) / 1000;
  return seconds < 60;
}

// Обновляем иконку и правила при изменении storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.givenMinuteTime) {
      updateIcon();
      // Обновляем правила блокировки при изменении паузы
      updateRules();
    }
    if (changes.prohibitedSites || changes.redirectUrl) {
      // Обновляем правила при изменении списка сайтов или URL редиректа
      updateRules();
    }
  }
});

// Обработчик сообщений для обновления иконки
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateIcon') {
    updateIcon();
    sendResponse({success: true});
  }
});

// Обновляем иконку при запуске
updateIcon();

// Периодически проверяем и обновляем иконку и правила (каждые 10 секунд)
setInterval(() => {
  updateIcon();
  // Проверяем, не истекла ли пауза, и обновляем правила
  updateRules();
}, 10000);



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
          updateIcon() // Обновляем иконку когда пауза истекает
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
      updateIcon() // Обновляем иконку после проверки
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
