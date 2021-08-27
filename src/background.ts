import Urbit from "@urbit/http-api";
import { EncryptedShipCredentials, BackgroundController, PermissionRequest, LWURequest } from "./types/types";

import { getPreference, getSelected } from "./storage"
import { fetchAllPerms, checkPerms, scry, thread, poke, subscribe } from "./urbit"

// opens extension in a full screen tab to use devtools properly, to delete in production
function openTab(filename: string) {
  // chrome.browserAction.setBadgeText({text: "nc"});
  // chrome.browserAction.setBadgeBackgroundColor({color: "#ff0000"});
  const myid = chrome.i18n.getMessage("@@extension_id");
  chrome.windows.getCurrent(function (win) {
    chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
      for (let i in tabArray) {
        if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) {
          // console.log("already opened"); 
          chrome.tabs.update(tabArray[i].id, { active: true }); return;
        }
      } chrome.tabs.create({ url: chrome.extension.getURL(filename) });
    });
  });
}
openTab("popup.html")
// chrome.cookies.getAll({}, cookies => console.log(cookies, "cookies"))
// chrome.cookies.getAllCookieStores(cookies => console.log(cookies))



const controller: BackgroundController = {
  locked: true,
  adding: false,
  cached_url: "",
  popupPreference: "modal",
  requestedPerms: null,
  activeShip: null,
  url: null,
  permissions: {}
}


// load popup preferences on startup
function loadPreferences() {
  getPreference()
    .then(res => controller.popupPreference = res)
    .catch(err => console.error(err))
}
loadPreferences();
// listen to changes in popup preference in storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.popup) loadPreferences();
});

// TODO sync permissions data from ship to browser storage


// background listener handles messages from the content script, fetches data from the extension, then sends back a response to the content script 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, "request")
  console.log(sender, "sender")
  console.log(controller, "controller as of now")
  // console.log(request, "background script receiving message from content script")
  // console.log(sender, "sender")
  // console.log(sender.tab 
  //   ? "from a content script:" + sender.tab.url 
  //   : "from the extension");
  // console.log(controller, "as of now controller is")
  // // idea would be to open the extension and trigger something here
  if (request.open) {
    chrome.browserAction.getPopup({}, (popup) => {
      sendResponse(popup)
    })
  }
  const needPerms = ["perms", "shipName", "shipURL", "scry", "thread", "poke", "subscribe"];
  if (needPerms.includes(request.type)) firewall(request, sender, sendResponse);
  else respond(request, sender, sendResponse);
  return true
});

// Different ways to display the popup
// window.postMessage({ app: "openModal" }, window.origin)
// chrome.tabs.create({url : "popup.html"})
// window.open("chrome-extension://apddmnnkhembaaebippnckmnhbgifcfl/popup.html");
// chrome.runtime.sendMessage({type: "locked"});

function openWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    focused: true,
    height: 600,
    width: 357,
    // top: 10,
    // left: 10
  });
}

function firewall(request: any, sender: any, sendResponse: any) {
  console.log(request, "firewall")
  if (controller.locked) {
    console.log('extension is locked')
    controller.locked = true;
    if (controller.popupPreference == "window") openWindow();
    else {
      chrome.browserAction.setBadgeText({ text: "1" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
      sendResponse("locked");
    }
  } else {
    if (request.type == "perms") bulkRequest(request, sender, sendResponse);
    else {
      fetchAllPerms(controller.url)
        .then(res => {
          console.log(res, "permissions!");
          console.log(sender, "sender")
          const existingPerms = res.bucket[sender.origin];
          if (!existingPerms) {
            controller.requestedPerms = { website: sender.origin, permissions: [request.type] };
            if (controller.popupPreference == "window") openWindow();
            else {
              chrome.browserAction.setBadgeText({ text: "1" });
              chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
              sendResponse("noperms");
            }
          } else {
            if (existingPerms.includes(request.type)) {
              respond(request, sender, sendResponse);
            } else {
              controller.requestedPerms = { website: sender.origin, permissions: [request.type] };
              if (controller.popupPreference == "window") openWindow();
              else {
                chrome.browserAction.setBadgeText({ text: "1" });
                chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
                sendResponse("noperms");
              }
            }
          }
        })
    }
  }
};

function bulkRequest(request: any, sender: any, sendResponse: any) {
  fetchAllPerms(controller.url)
    .then(res => {
      const existingPerms = res.bucket[sender.origin];
      console.log(existingPerms, "existingperms")
      console.log(request.data)
      if (existingPerms && request.data.every((el: LWURequest) => existingPerms.includes(el))) sendResponse("perms exist")
      else {
        controller.requestedPerms = { website: sender.origin, permissions: request.data, existing: existingPerms };
        chrome.browserAction.setBadgeText({text: "1"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
        sendResponse("noperms")
      }
    })
    .catch((err) => console.log(err, "failed to fetch"));
}

function respond(request: any, sender: any, sendResponse: any): void {
  switch (request.type) {
    // saves ship data to background state
    case "adding":
      controller.adding = true;
      sendResponse(controller.cached_url)
      break;
    case "please_cache":
      controller.cached_url = request.url
      break;
    case "done adding":
      controller.adding = false;
      controller.cached_url = "";
      break;
    case "selected":
      controller.url = request.url;
      controller.activeShip = request.ship
      console.log(controller, "ship selection saved to memory");
      if (request.url) controller.locked = false;
      else controller.locked = true;
      sendResponse(request.ship)
      break;
    // 
    case "active":
      sendResponse(controller)
      break;
    case "unlock":
      console.log(controller, "background controller before unlock request");
      controller.url = request.data;
      controller.locked = false;
      console.log(controller, "background controller after unlock request");
      sendResponse(controller);
      break;
    case "lock":
      controller.url = "";
      controller.locked = true;
      sendResponse(controller);
    case "dismissPerms":
      controller.requestedPerms = null;
      break;
    case "shipName":
      sendResponse(controller.activeShip.shipName)
      break;
    case "shipURL":
      sendResponse(controller.url)
      break;
    case "scry":
      scry(controller.url, request.data)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ error: err }))
      break;
    case "poke":
      const pokePayload = Object.assign(request.data, { onSuccess: handlePokeSuccess, onError: handleError });
      poke(controller.activeShip.shipName, controller.url, pokePayload)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ error: err }))
      break;
    case "thread":
      thread(controller.url, request.data)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ error: err }))
      break;
    case "subscribe":
      const payload = Object.assign(request.data, { event: (event: any) => handleEvent(event, sender.tab.id), err: handleError })
      subscribe(controller.activeShip.shipName, controller.url, payload)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ error: err }))
      break;
    default: break;
  }
}

function handlePokeSuccess() {
  window.postMessage({ app: "urbit-sse", poke: "ok" }, window.origin)
}
function handleEvent(event: any, tab_id: number) {
  console.log(event, "event handled, kinda")
  chrome.tabs.sendMessage(tab_id, { app: "urbit-sse", event: event })
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, {app: "urbit-sse", event: event}, function(response) {
  //     console.log(response,  "background received response");
  //   });
  // });
}
function handleError(error: any) {
  window.postMessage({ app: "urbit-sse", error: error }, window.origin)
}


// sighet-lopled-migted-wicmel