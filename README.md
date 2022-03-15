<h1 align="center">
  <img src="assets/visor-logo.png" width="224px"/><br/>
  Urbit Visor
</h1>
<p align="center">Urbit Visor is an extension which <b>transforms your web browser</b> into a <b>first class Urbit client</b>. Its goal is to allow existing web tech to seamlessly integrate together with the novel functionality of Urbit. </p>

<p align="center"><img src="https://img.shields.io/badge/version-v0.3.5-blue?style=for-the-badge&logo=none" />&nbsp;&nbsp;<img src="https://img.shields.io/badge/license-mit-blue?style=for-the-badge&logo=none" alt="license" /></p>

## Getting Started

The fastest way to get started using Urbit Visor is via the [Chrome Web Store](https://chrome.google.com/webstore/detail/urbit-visor/oadimaacghcacmfipakhadejgalcaepg).

This will provide you with a seamless install process and allow you to get up and running instantly. Alternatively the instructions below allow you to compile Urbit Visor locally.

## Compile It Yourself

To get started first clone this repo:

```
$ git clone https://github.com/dcSpark/urbit-visor
```

Once you have done that simply use `npm` to compile it yourself:

```
$ cd visor-extension
$ nvm use
$ npm install
$ npm start
```

This will install all of the dependencies and build the extension. Now that the project has been built, you can add the extension to your Chrome browser via the following steps:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory which has been created through the compilation process.

## ⚙️ Urbit Visor API

After a user installs the Urbit Visor extension into their web browser, the extension will inject a listener into each webpage that they visit. This allows both Urbit Web Apps and UV Extensions to import the `uv-core` library to use the exposed `urbitVisor` API object which seamlessly handles interacting directly with Urbit Visor, and thus the user's ship, without having to do any extra setup at all. (Note: Originally Urbit Visor injected the API directly into each web page, however in order to unify the Urbit Web App and UV Extension development experience and enable a unified `uv-components` library to be built, this approach was reworked into the current solution)

Below you will find the API which the current version of Urbit Visor supports. If a given method requires permission, this means that the user must grant the website permission to have access to use this method. If this authorization has not yet been given, Urbit Visor will automatically ask the user to authorize said permission upon attempt to use said method.

| Method                  | Description                                                                  | Requires Permission | Input                                                                      | Returns               |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------- | --------------------- |
| `isConnected`           | Returns whether or not the user actively has an Urbit ship connected.        | No                  | `()`                                                                       | `boolean`             |
| `getShip`               | Returns the user's ship @p.                                                  | Yes                 | `()`                                                                       | `string`              |
| `getURL`                | Returns the user's ship URL.                                                 | Yes                 | `()`                                                                       | `string`              |
| `scry`                  | Issues a scry on the user's ship and returns the result.                     | Yes                 | `({app: string, path: string})`                                            | `any`                 |
| `poke`                  | Issues a poke on the user's ship and returns the result.                     | Yes                 | `({app: string, mark: string, json: object})`                              | `number` (request id) |
| `thread`                | Runs a spider thread on the user's ship and returns the result.              | Yes                 | `({threadName: string, inputMark: string, outputMark: string, body: any})` | `any`                 |
| `subscribe`             | Subscribes to a gall app.                                                    | Yes                 | `({app: gall-app, path: /path})`                                           | `number` (request id) |
| `unsubscribe`           | Unsubscribes from a gall app.                                                | Yes                 | `({app: gall-app, path: /path})`                                           | `number` (request id) |
| `requestPermissions`    | Requests permissions from a given URL to Urbit Visor.                        | No                  | `Array<Permission>`                                                        | `void`                |
| `authorizedPermissions` | Returns the permissions that the user has authorized for the current domain. | No                  | `()`                                                                       | `Array<Permission>`   |
| `on`                    | Adds an event listener for a subscription to Urbit Visor Events.             | No                  | `(eventType: string, keys: Array<string>, callback: Function)`             | `Subscription`        |
| `off`                   | Removes an event listener set up by `on()`.                                  | No                  | `Subscription` (returned by `.on()`)                                       | undefined             |
| `require`               | Sets the required permissions for your app and ensures their presence.       | No                  | `(perms: Array<Permission>, callback: Function)`                           | undefined             |

### .on()

The `.on()` method is a useful helper method which simplifies adding event listeners for both Urbit Visor and Urbit ship events.

`eventType` is an `UrbitVisorEventType`, which you can find defined in `types.ts`. The second argument, an array of strings, is the keys of the expected data structure sent by your urbit.

E.g. Let's take a look at a graph-store chat message json:

```
{"graph-update": {"add-nodes": {"resource": resource, "nodes": {"post": post, "children: []}}}
```

You can add a listener for the exact key you need by passing an array of keys:

```
urbitVisor.on("sse", ["graph-update", "add-nodes", "nodes", "children"] , (data) => someCallback(data))
```

This will thus sent the sole argument, `children`, to the callback function that you call.

If you are looking for the whole data structure you can just pass an empty array.

### .require()

Visor offers a new endpoint to make the initial setup of your app much easier, thereby cleaning up most of the boilerplate.
Any app will need a defined set of permissions required to run it, e.g. you might want the ship name early on to display it to the user, as well as making sure you can scry or poke.
On the top page of your app (e.g. `App.tsx`) run `urbitVisor.require` and pass it two pieces of data: one array with the permissions you want, and a callback function to automatically query for the data that you know you will need.

e.g.

```
urbitVisor.require(["shipName", "scry", "subscribe"], setData);

function setData() {
  urbitVisor.getShip().then((res) => setShip(res.response));
  urbitVisor.subscribe({ app: "graph-store", path: "/updates" })
    .then((res) => console.log(res, "subscribed to graph-store"));
  const subscription = urbitVisor.on("sse", ["graph-update"], (data) => {
    handleGraphUpdate(data)
  });
};
function handleGraphUpdate(data){...}
```

The code above will make sure that your app checks the active ship on your Urbit visor for permissions to read the ship name, scry and subscribe; if they exist, it will run the `setData` callback, which sets the ship name into your application and subscribes to graph-store updates, then passes those updates to another function (with whatever behavior you need).
If the ship does not have the permissions required, it will automatically request them, and once granted, it will know that they were granted and automatically run the setData callback, greatly reducing the amount of initial code you need to write so you can focus on your business logic.

## FAQ

#### What does the "Your ship needs an OS update" error mean?

This typically happens when you have spawned a brand new comet which has not gone through any OTA updates and as such is running on an old version that makes it incompatible with Urbit Visor. Simply OTA using the following command in dojo:

```

|ota (sein:title our now our) %kids

```

## Credit

Urbit Visor was designed and built from scratch by [dcSpark](https://dcspark.io) and was made possible thanks to the [Urbit Foundation Grant Program](https://urbit.org/grants).
