/* global browser */

const filters = { urls: ['<all_urls>'] };

let allowed_tabs = new Set();

function removeHeader(headers, name) {
  if(headers){
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].name.toLowerCase() === name) {
      console.debug('[DEBUG] dropped:', name, headers[i].value);
      headers.splice(i, 1);
      // dont break! might be set mutliple times
    }
  }
 }
 return headers;
}

function doRemove(details, detailsParam, headername){
    let ret = {};
    ret[detailsParam] = removeHeader(details.requestHeaders, headername);
    return ret;
}

browser.webRequest.onBeforeSendHeaders.addListener(
    (details) =>  {
        if(!allowed_tabs.has(details.tabId)){
            return doRemove(details,'requestHeaders','cookie');
        }
},filters,['blocking', 'requestHeaders']);

browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        if(!allowed_tabs.has(details.tabId)){
            return doRemove(details,'responseHeaders','set-cookie');
        }
},filters,['blocking', 'responseHeaders']);

browser.browserAction.onClicked.addListener( (tab) => {
    if( allowed_tabs.has(tab.id) ){
        allowed_tabs.delete(tab.id);
        browser.browserAction.setBadgeText({tabId: tab.id, text: 'ON'});
        browser.browserAction.setBadgeBackgroundColor({tabId: tab.id, color: "green"});
    }else{
        allowed_tabs.add(tab.id);
        browser.browserAction.setBadgeText({tabId: tab.id, text: 'OFF'});
        browser.browserAction.setBadgeBackgroundColor({tabId: tab.id, color: "red"});
    }
});

browser.tabs.onUpdated.addListener ( (tabId, changeInfo, tabInfo) => {
    if(changeInfo.status === 'complete' && /^http/.test(tabInfo.url)) {
        browser.browserAction.enable(tabId);
        if( allowed_tabs.has(tabId) ){
            browser.browserAction.setBadgeText({tabId, text: 'OFF'});
            browser.browserAction.setBadgeBackgroundColor({tabId, color: "red"});
        }else{
            browser.browserAction.setBadgeText({tabId, text: 'ON'});
            browser.browserAction.setBadgeBackgroundColor({tabId, color: "green"});
        }
    }else{
        browser.browserAction.disable(tabId);
    }
}, { properties: ["status"] });

browser.browserAction.disable();


// copy the state of the openerTab - should make things easier for people
browser.tabs.onCreated.addListener( (tab) => {
    if( allowed_tabs.has(tab.openerTabId) ){
        allowed_tabs.add(tab.id);
    }
});
