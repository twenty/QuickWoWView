chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        let isTopic = (changeInfo.url.indexOf("/wow/t/") > -1); // Super dicey.
        if( isTopic ) {
            chrome.tabs.sendMessage( tabId, {
                url: changeInfo.url
            })
        }
        
    }
});