export function updateRules () {
    chrome.storage.sync.get('prohibitedSites', function(data) {
        chrome.storage.sync.get('redirectUrl', function(redirectData) {
            chrome.storage.sync.get('givenMinuteTime', function(time) {
                // Проверяем, активна ли пауза блокировки
                const isPaused = isBlockingPaused(time.givenMinuteTime);
                
                if (isPaused) {
                    // Если пауза активна - удаляем все правила
                    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
                        const ruleIds = existingRules.map(rule => rule.id);
                        if (ruleIds.length > 0) {
                            chrome.declarativeNetRequest.updateDynamicRules({
                                removeRuleIds: ruleIds
                            }, () => {
                                if (chrome.runtime.lastError) {
                                    console.error("Failed to remove declarativeNetRequest rules:", chrome.runtime.lastError.message);
                                } else {
                                    console.log("Declarative Net Request rules removed (paused).");
                                }
                            });
                        }
                    });
                    return;
                }

                // Если пауза не активна - применяем правила блокировки
                console.log('redirectData.redirectUrl', redirectData.redirectUrl)
                const prohibitedLinks = (data.prohibitedSites || '').split(/\n/).filter(link => link.trim() !== '')
                
                // Получаем существующие правила для удаления
                chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
                    const existingRuleIds = existingRules.map(rule => rule.id);
                    
                    const rules = prohibitedLinks.map((link, index) => {
                        return {
                            id: index + 1,
                            priority: 1,
                            action: {
                                type: "redirect",
                                redirect: {
                                    url: redirectData.redirectUrl || 'chrome://newtab'
                                }
                            },
                            condition: {
                                urlFilter: link,
                                resourceTypes: ["main_frame"]
                            }
                        }
                    })
                    
                    chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: existingRuleIds,
                        addRules: rules
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error("Failed to update declarativeNetRequest rules:", chrome.runtime.lastError.message);
                        } else {
                            console.log("Declarative Net Request rules updated successfully.");
                        }
                    });
                });
            });
        });
    })
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

export function addCurrentUrlToBlockList () {
    chrome.storage.sync.get('prohibitedSites', function(data) {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            const sites = data.prohibitedSites + '\n' + extractHostname(tabs[0].url)
            chrome.storage.sync.set({prohibitedSites: sites}, () => {
                closeProhibited()
                // Обновляем иконку после добавления сайта
                chrome.runtime.sendMessage({action: 'updateIcon'}, () => {});
            })
        });
    });
}

export function iterateAllTabs  (onTab) {
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                onTab(tab)

            });
        });
    });
}

export function redirectToBlockerWebsite(tab)  {
    chrome.storage.sync.get('redirectUrl', function(data) {
        chrome.tabs.update(tab.id, { url: data.redirectUrl });
    });
}

export function extractHostname(url) {
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

let closeTimeout

export function closeProhibited () {
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

export const onGiveMeMinute = () => {
    chrome.storage.sync.set({givenMinuteTime: Date.now().toString()}, () => {
        // Удаляем все правила блокировки при активации паузы
        updateRules();
        // Отправляем сообщение в background для обновления иконки
        chrome.runtime.sendMessage({action: 'updateIcon'}, () => {});
    })
}


export function init () {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        setCurrentHostName(tabs[0].url)
    });
}
