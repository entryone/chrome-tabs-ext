export function updateRules () {
    chrome.storage.sync.get('prohibitedSites', function(data) {
        chrome.storage.sync.get('redirectUrl', function(redirectData) {
            //setRedirectUrl(data.redirectUrl || '')
            //chrome.tabs.update(tab.id, { url: data.redirectUrl });


            const prohibitedLinks = (data.prohibitedSites || '').split(/\n/)
            const rules = prohibitedLinks.map((link, index) => {
                return {
                    id: index + 1,
                    priority: 1,
                    action: {
                        type: "redirect",
                        redirect: {
                            url: redirectData.redirectUrl
                        }
                    },
                    condition: {
                        urlFilter: link, // Убедитесь, что это совпадает с rules.json
                        resourceTypes: ["main_frame"]
                    }
                }
            })
            const rulesIds = rules.map(rule => rule.id)
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: rulesIds, // Удаляем правило с ID 1, если оно уже существует (для обновления)
                addRules: rules
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to update declarativeNetRequest rules:", chrome.runtime.lastError.message);
                } else {
                    console.log("Declarative Net Request rules updated successfully.");
                }
            });
        });
    })
}
