import Urbit from "@urbit/http-api";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"

export { Scry, Thread, Poke, SubscriptionRequestInterface };
export const VISOR_ID = "oadimaacghcacmfipakhadejgalcaepg";

export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe" | "auth";
export type UrbitVisorAction = "on" | "check_connection" | "check_perms" | "run_auth" | "shipURL" | "perms" | "shipName" | "scry" | "poke" | "subscribe" | "subscribeOnce" | "unsubscribe" | "thread";
type UrbitVisorRequestType = Scry | Thread<any> | Poke<any> | SubscriptionRequestInterface | UrbitVisorAction[];

export interface UrbitVisorRequest {
    app: "urbitVisor",
    action: UrbitVisorAction,
    data?: UrbitVisorRequestType
}
export interface UrbitVisorResponse {
    id: string,
    status: "locked" | "noperms" | "ok"
    response?: any
    error?: any
}

export interface UrbitVisorEvent {
    action: UrbitVisorEventType
    requestID?: string,
    data?: any
}
export type UrbitVisorEventType = UrbitVisorInternalEvent | UrbitEvent

type UrbitVisorInternalEvent = "connected" | "disconnected" | "permissions_granted" | "permissions_revoked"
type UrbitEvent = "sse" | "poke_success" | "poke_error" | "subscription_error"

export interface PermissionGraph{
    [key: string]: {
        permissions: Permission[]
    }
}

type UrbitAction = "scry" | "thread" | "poke" | "subscribe"

// export interface Permission{
//   date: number,
//   capability: UrbitAction[]
//   caveats: Caveat[]
// }

// interface Caveat{
//     name: string,
//     type: string,
//     value: any
    
// }