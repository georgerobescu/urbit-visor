import Urbit from "@urbit/http-api";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/dist/types"

export type DecryptedShipCredentials = {
    shipName: string;
    shipURL: string;
    shipCode: string;
};

export type EncryptedShipCredentials = {
    shipName: string;
    encryptedShipURL: string;
    encryptedShipCode: string;
};

export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe";

export type TabID = number;
export type ExtensionID = string;
export type PopupPreference = "modal" | "window";


export interface VisorSubscription {
    subscription: SubscriptionRequestInterface,
    subscriber: TabID | ExtensionID,
    airlockID: number,
    requestID: string
}

export interface UrbitVisorConsumerTab {
    tab: TabID,
    url: URL
};

 export interface UrbitVisorConsumerExtension {
    id: ExtensionID,
    name: string,
    tabs?: TabID[]
};

export interface PermissionsGraph {
    [key: string]: Permission[]
};

type Website = string;

export interface PermissionRequest {
    key: Website | ExtensionID,
    name?: string
    permissions: Permission[],
    existing?: Permission[]
}

export interface UrbitVisorState {
    airlock: Urbit,
    first: boolean,
    ships: EncryptedShipCredentials[],
    cached_url: string,
    cached_creds: EncryptedShipCredentials,
    popupPreference: PopupPreference,
    requestedPerms: PermissionRequest,
    selectedShip: EncryptedShipCredentials,
    activeShip: EncryptedShipCredentials,
    permissions: PermissionsGraph,
    consumer_tabs: Array<UrbitVisorConsumerTab>,
    consumer_extensions: UrbitVisorConsumerExtension[],
    activeSubscriptions: VisorSubscription[],
    init: () => Promise<void>,
    setMasterPassword: (password: string) => Promise<void>,
    addShip: (ship: string, url: string, code: string, pw: string) => Promise<void>,
    cacheURL: (url: string) => void,
    cacheCreds: (creds: EncryptedShipCredentials) => void,
    removeShip: (ship: EncryptedShipCredentials) => Promise<void>,
    selectShip: (ship: EncryptedShipCredentials) => void,
    connectShip: (url: string, ship: EncryptedShipCredentials) => Promise<any>,
    disconnectShip: () => void,
    requestPerms: (request: PermissionRequest) => void,
    grantPerms: (perms: PermissionRequest) => Promise<void>,
    denyPerms: () => void,
    removeWholeDomain: (url: string, ship: string, domain: string) => Promise<void>,
    revokePerm: (url: string, ship: string, perms: PermissionRequest) => Promise<void>,
    loadPerms: (permissions: PermissionsGraph) => void,
    changePopupPreference: (preference: PopupPreference) => Promise<void>,
    changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>
    resetApp: () => Promise<void>,
    addConsumerTab: (consumer: UrbitVisorConsumerTab) => void,
    addConsumerExtension: (consumer: UrbitVisorConsumerExtension) => void,
    addSubscription: (sub: VisorSubscription) => void,
    removeSubscription: (sub: VisorSubscription) => void
}
export interface PermissionRequest {
    key: Website | ExtensionID,
    name?: string
    permissions: Permission[],
    existing?: Permission[]
}

export type UrbitVisorAction = "on" | "check_connection" | "check_perms" | "shipURL" | "perms" | "shipName" | "scry" | "poke" | "subscribe" | "subscribeOnce" | "unsubscribe" | "thread";
export type UrbitVisorInternalAction = "state" | "connected" | "cache_form_url" | "end_url_caching" | "dismiss_perms";
type UrbitVisorRequestType = Scry | Thread<any> | Poke<any> | SubscriptionRequestInterface | UrbitVisorAction[]

export interface UrbitVisorRequest {
    app: "urbitVisor",
    action: UrbitVisorAction,
    data?: UrbitVisorRequestType
}
export interface CommandLauncherRequest {
    app: "command-launcher",
    action: string,
    data?: any
}
export interface UrbitVisorResponse {
    id: string,
    status: "locked" | "noperms" | "ok"
    response?: any
    error?: any
}

export interface UrbitVisorInternalComms {
    action: UrbitVisorInternalAction | string,
    data?: any
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
