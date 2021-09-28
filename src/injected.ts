import { fromEvent, Subscription } from "rxjs";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types";
import { UrbitVisorAction, UrbitVisorRequest, UrbitVisorResponse, UrbitVisorEventType } from "./types/types";
import { Messaging } from "./messaging";

function showPopup(text: string) {
  const background = document.getElementById("urbit-visor-modal-bg");
  background.style.display = "block";
  background.style.opacity = "0.9";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = text;
  setTimeout(() => background.style.display = "none", 3000);
}

function promptUnlock() {
  showPopup("Connect to a ship with your Urbit Visor");
}
function promptPerms() {
  showPopup("Open your Urbit Visor to grant permissions.");
}

async function requestData(action: UrbitVisorAction, data: any = null): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const response = await Messaging.callVisor({ app: "urbitVisor", action: action, data: data });
    if (response.status === "locked") promptUnlock(), reject();
    else if (response.status == "noperms") promptPerms(), reject();
    else if (response.error) reject(response)
    else resolve(response)
  })
};

async function checkConnection(): Promise<UrbitVisorResponse> {
  const response = await Messaging.callVisor({ app: "urbitVisor", action: "check_connection" });
  return response
}

async function checkPermissions(): Promise<any> {
  const response = await Messaging.callVisor({ app: "urbitVisor", action: "check_perms" })
  return response
}


(window as any).urbitVisor = {
  isConnected: () => checkConnection(),
  promptConnection: () => promptUnlock(),
  authorizedPermissions: () => checkPermissions(),
  getShip: () => requestData("shipName"),
  getURL: () => requestData("shipURL"),
  requestPermissions: (permissions: UrbitVisorAction[]) => requestData("perms", permissions),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface, once?: boolean) => requestData("subscribe", { payload: payload, once: once }),
  unsubscribe: (payload: number) => requestData("unsubscribe", payload),
  on: (eventType: string, details: EventSubscription, callback: Function) => addListener(eventType, details, callback),
  off: (subscription: Subscription) => subscription.unsubscribe()
};

type EventSubscription = {
  gallApp?: string,
  dataType?: string
}
function addListener(eventType: string, details: EventSubscription, callback: Function) {
  console.log(eventType, "event type")
  console.log(details, "details")
  const messages = fromEvent<MessageEvent>(window, 'message');
  return messages.subscribe((message) => {
    const data = message?.data?.event?.data;
    if (message.data.app == "urbitVisorEvent" && message.data.event.action == eventType) {
      if (data?.[details?.gallApp] && data?.[details?.gallApp][details?.dataType] ) callback(message.data.event.data[details.gallApp][details.dataType])
      else if (!details.dataType && data?.[details?.gallApp]) callback(message.data.event.data[details.gallApp])
      else if(!details.gallApp) callback(message)
    }
  });
}