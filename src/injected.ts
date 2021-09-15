import { EventEmitter } from 'events';
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types";
import {UrbitVisorAction, UrbitVisorRequest, UrbitVisorResponse} from "./types/types";
import {Messaging} from "./messaging";

function showPopup(text: string){
  const background = document.getElementById("urbit-visor-modal-bg");
  background.style.display = "block";
  background.style.opacity = "0.9";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = text;
  setTimeout(()=> background.style.display = "none", 3000);
}

function promptUnlock(){
  showPopup("Connect to a ship with your Urbit Visor");
}
function promptPerms(){
  showPopup("Open your Urbit Visor to grant permissions.");
}

async function requestData(action: UrbitVisorAction, data: any = null): Promise<any>{
  return new Promise(async (resolve, reject) =>{
    const response = await Messaging.callVisor({app: "urbitVisor", action: action, data: data});
    if (response.status === "locked") promptUnlock(), reject();
    else if (response.status == "noperms") promptPerms(), reject();
    else if (response.error) reject(response)
    else resolve(response)
  })
};

async function checkConnection(): Promise<UrbitVisorResponse>{
  const response = await Messaging.callVisor({app: "urbitVisor", action: "check_connection"});
  return response
}
async function promptConnection(){
  const response = await Messaging.callVisor({app: "urbitVisor", action: "prompt_connection"});
}
async function checkPermissions(): Promise<any>{
  const response = await Messaging.callVisor({app: "urbitVisor", action: "check_perms"})
  return response
}


(window as any).urbitVisor = {
  // on: (action: string, fn: Function) => listen(action),
  isConnected: () => checkConnection(),
  promptConnection: () => requestData("prompt_connection"),
  authorizedPermissions: () => checkPermissions(),
  getShip: () => requestData("shipName"),
  getURL: () => requestData("shipURL"),
  requestPermissions: (permissions: UrbitVisorAction[]) => requestData("perms", permissions),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload)
};