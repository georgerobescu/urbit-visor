import { UrbitVisorRequest, CommandLauncherRequest, UrbitVisorEvent, UrbitVisorResponse, UrbitVisorState, UrbitVisorInternalComms } from "./types";

const Messaging = {
    sendToPopup: async function (message: { state: UrbitVisorState }): Promise<void> {
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage(message, (response) => res(response))
        );
    },
    sendToBackground: async function (request: UrbitVisorInternalComms): Promise<any> {
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage({
                ...request, app: "urbit-visor-internal",
            }, (response) => res(response))
        );
    },
    relayToBackground: async function (request: UrbitVisorRequest | CommandLauncherRequest): Promise<UrbitVisorResponse> {
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage(request, (response) => res(response))
        );
    },
    pushEvent: function (event: UrbitVisorEvent, recipients: Set<any>) {
      for (let id of recipients) {
          if (typeof id == "number") chrome.tabs.sendMessage(id, { app: "urbitVisorEvent", event: event})
          if (typeof id == "string") chrome.runtime.sendMessage(id, { app: "urbitVisorEvent", event: event})
      }
    },
    callVisor: function ({ app, action, data }: UrbitVisorRequest): Promise<UrbitVisorResponse> {
        return new Promise((res, rej) => {
            const requestId = Math.random().toString(36).substr(2, 9);
            // first add listener for the eventual response
            window.addEventListener('message', function responseHandler(e) {
                const response = e.data;
                // ignore messages with the wrong request app name, wrong id, or null
                if (response.app !== "urbitVisorResponse" || response.id !== requestId) return;
                // remove listener else they keep stacking up
                window.removeEventListener('message', responseHandler);
                // reject promise if there's an error
                if (response.error) rej(response.error);
                // resolve if fine
                else res(response);
            });
            window.postMessage({ action, data, app, id: requestId }, window.origin);
        });
    },
    createProxyController: () => {
        console.log("Urbit Visor present")
        //listen to function calls from webpage
        window.addEventListener('message', async function (e) {
            const request = e.data;
            if (request && request.app !== "urbitVisor") return;
            // relay message to background script
            request.origin = e.origin;
            Messaging.relayToBackground(request).then((response: UrbitVisorResponse) => {
                // relay back responses to webpage
                window.postMessage({ app: "urbitVisorResponse", id: request.id, status: response?.status, response: response?.response }, window.origin)
            })
            return;
        });
        // listen to events from the background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // relay events to webpage
            if (request.app == "urbitVisorEvent") {
                window.postMessage(request, window.origin);
                sendResponse("ok")
            } else sendResponse("ng")
            return true
        }
        );
    }
};

export { Messaging }
