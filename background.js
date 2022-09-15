/* global browser */

const filters = { urls: ['<all_urls>'] };

let allowed_tabs = new Set();
let global_off = false; //

function removeHeader(headers, name) {
  if(headers){
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].name.toLowerCase() === name) {
      console.log('dropped', name, headers[i].value);
      headers.splice(i, 1);
      // dont break! might be set mutliple times
    }
  }
 }
}

function doRemove(details, detailsParam, headername){
    removeHeader(details.requestHeaders, headername);
    let ret = {};
    ret[detailsParam] = details[detailsParam];
    return ret;
}

browser.webRequest.onBeforeSendHeaders.addListener(
    (details) =>  {
        if(global_off || allowed_tabs.has(details.tabId)){
            return;
        }
},filters,['blocking', 'requestHeaders']);

browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        if(global_off || allowed_tabs.has(details.tabId)){
            return;
        }
        return doRemove(details,'responseHeaders','set-cookie');
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

