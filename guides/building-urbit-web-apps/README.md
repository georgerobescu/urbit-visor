# Building Urbit Web Apps - Developer Guide

Many developers who first hear about Urbit get excited about the amount of underlying potential which lays within. An always-on server which can act as a persistant-global data store, packed with native identity, p2p messaging, and a full computation stack.

However one of the key problems of getting into the Urbit ecosystem as a developer is just how much one needs to learn to even dip their toe in. Having to understand what Arvo or vanes are, learning hoon, understanding how gall agents work, and more are on a long laundry list of "essentials" you need to get started.

Though this has been the path of entry into the ecosystem up to this point, Urbit Visor was made precisely to provide an alternative that simplifies the onboarding process for new devs by multiple orders of magnitude. It provides web developers all the power and convenience of Urbit while using the strengths and availability of the battle-tested web platform.

In this guide we'll build a simple note-taking web app using React (with hooks, of the most recent style) and TypeScript. Urbit Visor works with any Javascript setup of your choice, so feel free to use your preferred stack once you finish and understand the basic concepts.

This guide will teach you how to interact and use Urbit Visor inside of your app, not teach you how to use React or how to style your application with CSS. We expect basic JS/TS proficiency in this guide.

You can find the final source code of the project that you will build in this guide at: https://github.com/dcspark/urbit-notes/.

## Setting Up Urbit Visor

To get started first you need to go [install Urbit Visor](https://chrome.google.com/webstore/detail/urbit-visor/oadimaacghcacmfipakhadejgalcaepg) from the Chrome Webstore, or compile it yourself ([instructions](https://github.com/dcSpark/urbit-visor)).

Once you've installed Urbit Visor in your local browser (any Chromium-derived browser like Chrome, Brave or Opera will work),
make sure you have an Urbit ship (personal server) running. Any Urbit ship works, local or remote, real or fake (used for development), from comets to galaxies.

Learn more about setting up your own Urbit ship [with this getting started guide](https://urbit.org/getting-started).

![image here getting +code from webterminal of a fakezod](assets/code.png)

With your ship up and running, you simply need to acquire the `+code` password at the dojo/port/web terminal (by typing `+code` and copying the response), and use that + your ship's IP to add it inside of Urbit Visor. Feel free to follow [this youtube video](https://www.youtube.com/watch?v=CNE59jRG5Og) for a clear video demonstration of how to do this.

![image here adding ship to Visor](assets/add-ship.png)

Now that you have your ship added to Visor, you have access to the exact same unified API that every one of your users will. We can now treat the user's Urbit ship as a seamless dev ops free backend (that is personalized to each user), without any extra work on the developer's side.

With all of that basic setup out of the way, let's get developing.

## Creating Your Project

To reiterate, Urbit Visor is framework agnostic. You can use it in whatever project you desire as long as you can import javascript dependencies.

Existing apps already exist using React and Svelte, but any other framework, or even vanilla JS should work fine. This guide will assume you are building a React app, but the general logic does not change much no matter what you're using.

To improve the developer experience, Urbit Visor exposes a few TypeScript types for type safety. In this guide we will be using TypeScript, but if you're not, feel free to ignore the type annotations.

As mentioned earlier, we will be creating a simple note-taking Urbit web app which will be called `urbit-notes`. Let's create the base boilerplate for your project using [vite](https://vitejs.dev), a great build tool for JavaScript applications:

```bash
npm create vite@latest
```
Then choose a name, and `react-ts` as our template.

To enable Urbit Visor functionality in your app you need to install the library `@dcspark/uv-core`. If you use npm, go to your app folder, and run

```bash
npm i --save @dcspark/uv-core
```

This will install and save the `@dcspark/uv-core` library.

Now let's open `App.tsx` and start building the webapp.

## Integrating With Urbit Visor

### Importing `urbitVisor`

To start, you will need to import the `urbitVisor` object at the top of the file.

```tsx
import { urbitVisor } from "@dcspark/uv-core";
```

Note that `urbitVisor` is just an object which includes a bunch of functions. It is not a `Class` that you have to initialize. You simply need to call one of the `urbitVisor` object's functions whenever you need to fetch or pass data to the Visor. You can check out [the Github page](https://github.com/dcSpark/urbit-visor) for details on all the functions exposed by the object.

### Importing Types

You can also import types from the core library by doing:

```tsx
import type { Permission, Scry, Poke } from "@dcspark/uv-core";
```

Now let's see how the initial setup process works.

## Permissions

One of the key parts of Urbit Visor is _permissions_. These permissions ensure that there is a firewall between the web and your Urbit ship to control who has access to what kind of data. Your Urbit server is forever, and people can and do hold vast amounts of sensitive data inside them, so you want to be careful there. That's one of the core needs that Urbit Visor was designed to address.

The permission system of Urbit Visor is still evolving, and will get more granular and sophisticated over time. As of present (version 0.3.3), Urbit Visor exposes six types of permissions, which are defined in the `Permission` type.

```tsx
export type Permission =
  | "shipName"
  | "shipURL"
  | "scry"
  | "thread"
  | "poke"
  | "subscribe";
```

`shipName` and `shipURL` are fairly easy to understand. `shipName` allows a webapp to fetch the name of the ship currently connected to the Urbit Visor (ex. ~zod), `shipURL` exposes the URL that you use to access your ship. If your ship is on local, that would be `http://localhost`. If your ship is hosted remotely, that's the URL that you use to access the Grid interface (and through it Landscape, etc.).

The other four permissions are a bit more technical. Let's go through them one by one.

## The Four Basic Urbit Actions

Urbit is a "clean-slate OS" which rearchitectured the stack from the ground up, from it's VM bytecode to its networking protocol. It is of course a Turing-complete computer, so it can run any code you write for it, but some of the concepts can be unfamiliar at first and take a bit to get used to. Let's take a look at the four basic actions:

[Scries](https://urbit.org/docs/arvo/concepts/scry) are requests to fetch data. In HTTP they map to GET requests.

[Subscriptions](https://urbit.org/docs/arvo/concepts/subscriptions) are long-running connections to a resource. Subscriptions don't immediately return data, instead, on a pub-sub pattern, they open an EventSource (i.e. Server-side Events) connection, and the Urbit ship will send data your way whenever there is an update to the resource you subscribed to.

[Pokes](https://urbit.org/docs/userspace/gall-guide/6-pokes) are the basic way to send data to an Urbit ship. They are a bit special though, in HTTP terms they are PUT requests, and they don't return data. A poke is a one-off request, which then may (or may not) trigger some update on the app it was sent to, which would then be sent by the subscription wire (to Visor, the pub-sub EventSource connection). So a common pattern is to subscribe to a certain app, poke it with new data, and then listen to the events sent through that subscription.

[Threads](https://urbit.org/docs/userspace/threads/overview) are a distinct type of Urbit action, used usually to enable async functionality which is harder to do in normal Urbit apps. In what concerns Urbit Visor, `thread` calls are POST requests which send json data in the body and usually return json data back. Threads may potentially trigger further changes that would be sent through the subscription wire.

We will see each action in more detail as we use them in this app.

## Initial boilerplate

The first thing a developer must do when importing Urbit Visor is declare what permissions the app will need. There's a variety of ways to do that (see details at [the Visor Github page](https://github.com/dcSpark/urbit-visor/)) but the recommended way to organize your permissions logic is by calling the `urbitVisor.require` function.

`require` takes two arguments, one an array of `Permission`, which we just saw above.
The second argument is a callback function which will be called once the Visor has made sure the required permissions are available.
Best practice is to define a function (call it e.g. `setData` or `setUrbitData`) to set all the initial data you want to collect, (e.g. the ship name, maybe some subscription) and pass it to `urbitVisor.require` alongside the list of permissions your app will need.

So let's do this in our `urbit-notes` app. On `App.tsx` we will add the following to the `useEffect()` function, so the Urbit Visor initial setup is run when the app mounts.

```ts
urbitVisor.require(["shipName"], setData);
```

That is all we need. This will make sure that every time the app is launched, Urbit Visor is asked for the required permissions, and if they have already been granted, the `setData()` function is run, collecting all the data we need at once.

So this brings us to the next obvious question. What do we put inside the `setData()` function?

Let's start with something simple.

```ts
const [ship, setShip] = useState("");
function setData() {
  urbitVisor.getShip().then((res) => setShip(res.response));
}
```

This makes it so your app declares a variable `ship`, which is first an empty string. Once the app is launched, Urbit Visor will be queried for the ship name, using the `getShip()` function of the `urbitVisor` object. If permissions don't exist, the request will fail, and Urbit Visor will show you a popup asking you to grant permissions. If permissions do exist, the ship name will be fetched and populate the `ship` variable.

Let's edit the initial boilerplate that `vite` provided to see how this works in practice.

```tsx
import "./App.css";
import { useState, useEffect } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import type { Permission } from "@dcspark/uv-core";

function App() {
  const [ship, setShip] = useState("");
  useEffect(() => {
    urbitVisor.require(["shipName"], setData);
  }, []);

  function setData() {
    urbitVisor.getShip().then((res) => setShip(res.response));
  }

  return (
    <div className="App">
      <header className="App-header">
        {ship && <p>Hi ~{ship}</p>}
        <p>Welcome to Urbit Notes.</p>
        <p>your one and only 100% private, yet networked, notes application.</p>
      </header>
    </div>
  );
}
export default App;
```

Save the `App.tsx` file and run your app. If your Urbit Visor has no ship connected, your app will prompt you to connect a ship.

![image here showing the visor connection prompt](assets/prompt.png)

If a ship is connected, you will get a prompt to give permissions to your app. It's the first time we run it so of course you don't have any permission. Click on the Urbit Visor extension icon to grant permissions.

![image here showing permission prompt screen](assets/perms.png)

Once you grant permissions, the app will start automatically. You should get something like this:

![image here showing initial screen](assets/welcome.png)

Congratulations, you have successfully used UrbitVisor to fetch data from a running Urbit server.

## Designing the app

As we mentioned, this example app is going to be called Urbit Notes. It's a simple note taking app that will use `graph-store`, the database used by the Groups (aka Landscape) app in Urbit to save chat, notebook and collection data. Our app will use Urbit Visor to make a personal notebook, writes notes, edit them, and of course read them.

The app will be running externally on a web2 server, but all data will be hosted in your own Urbit ship. Ever heard of Web3? The Decentralized Web? Well this is what it's all about.

Complete control of your data. Only really feasible on Urbit. And no gas fees to boot! But we digress, let's go back to the code.

As we mentioned there's two primary actions we need to perform in this app. Read data, and write data. In Urbit terms that means we need to `scry` and `poke`.

While not strictly necessary for this simple app, we will also `subscribe` to data so we can get an update sent to us once the data has been written to disk, and to show how subscriptions work with Urbit Visor. We will also call a `thread` for some complex functionality already implemented on `graph-store`.

Moving forward, let's change the permissions required for Urbit Notes:

```tsx
useEffect(() => {
  urbitVisor.require(
    ["shipName", "scry", "subscribe", "poke", "thread"],
    setData
  );
}, []);
```

Now we have added all of the permissions we are going to need to enable the full functionality of the app. If you run your app again (via `npm run dev`) you will see that Urbit Visor will prompt you to grant the permissions which you newly added. Authorize the permissions on your end.

Let's now edit the `setData()` function to set up the notebook in which we will write/save our notes on the Urbit ship.

But before we get there, first we need to make sure that the notebook channel exists, so we can go straight to the app or show a Welcome Screen to newcomers. To do this we will fetch all of the Landscape channels to which our ship is subscribed to, and check if the Notes notebook already exists.

To do that we are going to perform a `scry`.

## Scries

Fro mehre we'll declare a function, `checkChannelExists`, to check whether our notebook channel exists already. First of all we'll `scry` the list of all channels our ship is subscribed to, and log them to the console.

```ts
function setData() {
  urbitVisor.getShip().then((res) => {
    setShip(res.response);
    checkChannelExists();
  });
}
function checkChannelExists() {
  urbitVisor.scry({ app: "graph-store", path: "/keys" }).then((res) => {
    if (status === "ok") console.log(res.response["graph-update"].keys);
  });
}
```

Notice, we have added a call to the `urbitVisor.scry` function.
`urbitVisor.scry` call takes one argument, an object with two attributes, `app` and `path`.

```ts
interface Scry {
  app: GallAgent;
  path: Path;
}
```

`app` is the app, or in Urbit parlance, the Gall agent you are requesting data from.

`path` is the "scry path", the internal way that Urbit defines how to branch out data requests. Scry paths look similar to URL or unix file paths, as a series of words separated by forward slashes (or `fas` as we say in Urbit) e.g. `"/one/two/three/"` or `/graph/~dopzod/urbit-help/`.

Every app defines its own scry paths (aka endpoints), so check out the documentation of the Gall agents you will be using to make sure what paths are available.

In this case we are scrying the `/keys` path of the `graph-store` app. Every scry endpoint will produce a different data structure. In the case of `graph-store/keys` it returns an object with one key, `graph-update`. Inside of this object, it includes another object with one key, `keys`, whose value is an array of keys (see the type defined above); one for each channel your ship is subscribed to.

## Note On Error Handling

All `urbitVisor` functions that move data from and to your Urbit ship are of course async, and return promises. You can use `async-await` or `then().catch()` or `Promise.all()` or whatever it is your preferred pattern.

Visor requests can of course fail, either because of network errors, in which case the Promise might be rejected, or because of some issue Urbit-side (perhaps due to a malformed request). Every Urbit Visor response will return an object with a `status` key and a `response` key. Good responses will return `status: "ok"`, while bad responses will return `status: "error"`. You can do error handling by matching on the responses as:

```ts
if (res.status === "ok") handleSuccess(res.response);
else if (res.status === "error") handleError(res.response);
```

Now that we have the list of channels we can check if our Urbit Notes notebook is amongst them. Let's declare a new state variable, `registered`, and change its value according to whether `keys` contains our notebook or not.

```ts
  interface Key{
    name: string // the name of the channel, in kebab-case.
    ship: string // the ship that hosts the channel
  }
  const [registered, setRegistered] = useState(false);
  function checkChannelExists(){
    urbitVisor.scry({app: "graph-store", path: "/keys"}).then(res => {
      if (status === "ok") {
        const keys: Key[] = (res.response["graph-update"].keys);
        if (keys.find(key: Key => key.ship === ship, key.name === "my-urbit-notes") setRegistered(true));
        else createChannel();
      }
      else handleKeyScryError();
    });
  };
```

We added some logic to our `checkChannelExists` function to see whether the notebook exists already.

Our Notebook is a `Key` object with our ship as the host, and "my-urbit-notes" as the channel name. If the `keys` array that we scried from your Urbit ship already contains our notebook, it will set the `registered` variable as `true`. That's rather unlikely at this stage though, as we haven't created the channel yet. The `if` statement will evaluate to `false`, which will call the `createChannel()` function.

To create a channel we need to dive into another Urbit concept, the `thread`, so let's get to it.

## Threads

Threads are in fact one of the more complex parts of Urbit apps, but as it so happens creating a `graph-store` personal channel is also quite complicated to do yourself without threads. As such for this next step we'll have to look into how to call a `thread`.

`graph-store` channels all must belong to groups, so to create a personal channel you must first create a group, then a channel inside that group. One of the uses of threads is to chain multiple actions into one single function call and get one single result once they're all done. The developers at Tlon made the `add-graph` thread that simplifies the process of creating `graph-store` channels.

In HTTP terms, `threads` are POST requests, which pass a json body to your Urbit ship in the request and get a json body back in the response. Let's call `urbitVisor.thread` and create a channel for our Notebook.

```ts
interface Thread {
  threadName: string; // name of the channel
  inputMark: string; // json to hoon conversion mark for the thread request body
  outputMark: string; // hoon to json conversion mark for the thread response body
  body: any; // request body
}
async function createChannel() {
  const body = {
    create: {
      resource: {
        ship: `~${ship}`,
        name: "my-urbit-notes",
      },
      title: "My Urbit Notes",
      description: "My Awesome Private Urbit Notebook",
      associated: {
        policy: {
          invite: { pending: [] },
        },
      },
      module: "publish",
      mark: "graph-validator-publish",
    },
  };
  urbitVisor
    .thread({
      threadName: "graph-create",
      inputMark: "graph-view-action",
      outputMark: "json",
      body: body,
    })
    .then((res) => {
      if (res.status === "ok") checkChannelExists();
      else handleThreadError();
    });
}
```

`urbitVisor.thread` takes one argument, an object with four keys. `threadName` is the name of the thread you are calling. Next are `inputMark` and `outputMark`. [Marks](https://urbit.org/docs/arvo/clay/marks) in Urbit are files with instructions about how to convert data structures to different format. Urbit Visor of course passes json data around, but Urbit native data structures have their own format. Marks tell your Urbit ship how to convert (or text, or any data type you define) to the native Hoon data structure that the Urbit app or thread is expecting.

Threads both send and receive data from an Urbit ship, so you need both an input mark, that defines how to translate the request body json into something that Urbit will understand, and an output mark, which defines how to translate the result of your thread into json that your browser can read.
In the case of the `graph-create` thread, it expects the `graph-view-action` mark for input data, and the more generic `json` mark for the body output.

The thread `body` will depend on which thread you are calling. As we are calling `graph-create`, we are passing all the data necessary to create a new channel: the channel name (which must be a URL safe string in kebab-case), the channel type (or 'module', 'publish' refers to notebooks, 'chat' to chat rooms, 'link' to collections), etc. `graph-store` data structures are rather complicated, as we will see during the guide.

As it happens, the `create-graph` thread only returns `null`, so as long as the `urbitVisor.thread` function returns `status: "ok"` we can safely assume the channel was created successfully, so we'll call `checkChannelExists()` again to confirm.

You have now created your channel and can now proceed moving forward with reading and writing notes.

## End of initial flow

We now have all of the initial code in place for a note writing app.

To progress forward, we must first ask Urbit Visor for the necessary permissions. From there we will check if our Urbit server contains the notebook that the app will use as its backend datastore. If it doesn't exist, we will create the notebook.

After that, we have to add some code to display the contents of the notebook when the app runs. And while we're at it, we'll add a spinner which displays while the data is loading, and some simple error handling on top.

Adding all of these features in `App.tsx` will look as follows:

```tsx
import "./App.css";
import { useState, useEffect } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import Notebook from "./Notebook";
import Spinner from "./Spinner";

function App() {
  const [ship, setShip] = useState("");
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const spinner = (
    <Spinner width={100} height={100} innerColor="white" outerColor="black" />
  );

  useEffect(() => {
    urbitVisor.require(["shipName"], setData);
  }, []);

  function setData() {
    urbitVisor.getShip().then((res) => setShip(res.response));
  }

  interface Key {
    name: string; // the name of the channel, in kebab-case.
    ship: string; // the ship that hosts the channel
  }
  function checkChannelExists(ship: string) {
    urbitVisor.scry({ app: "graph-store", path: "/keys" }).then((res) => {
      setLoading(false);
      if (res.status === "ok") {
        const keys: Key[] = res.response["graph-update"].keys;
        if (
          keys.find(
            (key: Key) => key.ship === ship && key.name === "my-urbit-notes"
          )
        )
          setRegistered(true);
      } else handleKeyScryError();
    });
  }
  function handleKeyScryError() {
    setError("Scry failed");
  }
  function handleThreadError() {
    setError("Thread failed");
  }
  interface Thread {
    threadName: string; // name of the channel
    inputMark: string; // json to hoon conversion mark for the thread request body
    outputMark: string; // hoon to json conversion mark for the thread response body
    body: any; // request body
  }
  async function createChannel() {
    const body = {
      create: {
        resource: {
          ship: "~zod",
          name: "my-urbit-notes",
        },
        title: "My Urbit Notes",
        description: "My Awesome Private Urbit Notebook",
        associated: {
          policy: {
            invite: { pending: [] },
          },
        },
        module: "publish",
        mark: "graph-validator-publish",
      },
    };
    urbitVisor
      .thread({
        threadName: "graph-create",
        inputMark: "graph-view-action",
        outputMark: "json",
        body: body,
      })
      .then((res) => {
        if (res.status === "ok") checkChannelExists();
        else handleThreadError();
      });
  }

  if (loading)
    return (
      <div className="App">
        <div className="loading">{spinner}</div>
      </div>
    );
  else if (!registered)
    return (
      <div className="App">
        <header className="App-header">
          {ship && <p>Hi ~{ship}</p>}
          <p>Welcome to Urbit Notes</p>
          <p>
            Your one and only 100% private, yet networked, notes application.
          </p>
          {!ship && (
            <button className="create-button" onClick={createChannel}>
              Connect your Urbit Visor
            </button>
          )}
          {ship && (
            <button className="create-button" onClick={createChannel}>
              Setup your Notebook
            </button>
          )}
          {error && <p className="error-message">{error}</p>}
        </header>
      </div>
    );
  else
    return (
      <div className="App">
        <Notebook ship={ship} />
      </div>
    );
}
export default App;
```

## Writing Notes

Now that we have finished the initial user onboarding flow, we will progress by creating a new component, `Notebook`. This component will render the contents of the notebook in the user's ship (where all the notes will be stored) for the user to be able to view and edit in our web app.

Note: Type annotations are getting complicated so we'll move them to the `types.ts` file, which you can check in this Github repo.

```tsx

import "./App.css";
import { useState, useEffect, useReducer } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import type { Graph, Post, Content, TextContent } from "./types";
import Spinner from "./Spinner";

interface NotebookProps {
  ship: string; // ship name
}


function Notebook(props: NotebookProps) {
  const [posts, setPosts] = useState<Graph>({});
  const [loading, setLoading] = useState(true);
  const spinner = (
    <Spinner width={40} height={40} innerColor="white" outerColor="black" />
  );

  useEffect(() => {
    urbitVisor.scry({
      app: "graph-store",
      path: `/graph/~${props.ship}/my-urbit-notes`,
    }).then(res => {
      setPosts(res["graph-update"]["add-graph"]["graph"])l
      setLoading(false);
    }
  }, []);

  return (
    <div className="notebook">
    <header> My Urbit Notes </header>
    </div>
  );
}
export default Notebook;

```

As you may have noticed at this point what we don't have yet are the notes themselves. Our brand new, private, networked Urbit notebook is still empty. Let's remedy that and start writing notes.

## Pokes

To write a note we'll need to learn about `pokes`. In the Four Basic Urbit Actions section we mentioned that _pokes_ are the basic method of sending data to an Urbit ship (akin to a POST request).

To add new notes to the Urbit notebook, we'll need to send data to `graph-store`. To do that we need to send a command with a json body that specifies a post should be added to the notebook we created. The way to do that is to send a `poke`, using the `urbitVisor.poke` function.

`urbitVisor.poke` takes one argument, an object with three keys:

```ts
interface Poke {
  app: GallAgent;
  mark: Mark;
  json: any;
}
```

`app` is the same argument type as in `urbitVisor.scry`. It is the Urbit app that we are sending the request to.

`mark` we already saw in the Threads section. It is a string which matches an [Urbit mark](https://urbit.org/docs/arvo/clay/marks); a file with instructions about how to handle the json body of the request.

`json` is the body of the request, a data structure which will differ depending on the app and the action you are triggering.

Pokes are unidirectional, they do not return data back to the caller. Thus we only need one mark here, the input mark, to tell Urbit how to translate our json body.

Now that we have explained how pokes work, let's define a function to send our own `poke`.

```ts
function buildPost(index: string, contents: Content[] = []) {
  return {
    author: "~" + props.ship,
    contents: contents,
    hash: null,
    index: index,
    signatures: [],
    "time-sent": Date.now(),
  };
}
function addNotebookPost() {
  // Every graph-store node needs a unique index, so we need to autoincrement. 
  // Graph-store indexes are very long, however, so we will parse them as JavaScript BigInt.
  // These variables will make more sense later when we
  // show how to translate graph-store data structures for use in our app
  const indexes: bigint[] = graphToList(posts).map((p) => p.index);
  const last: bigint = indexes.reduce(
    (acc: bigint, cur: bigint) => (acc > cur ? acc : cur),
    0n
  );
  const index = `/${last + 1n}`.replace("n", "");
  const contents = [{ text: title }, { text: text }];
  const children = {
    "1": {
      post: buildPost(`${index}/1`),
      children: {
        "1": {
          children: null,
          post: buildPost(`${index}/1/1`, contents),
        },
      },
    },
    "2": {
      post: buildPost(`${index}/2`),
      children: null,
    },
  };
  const nodes = {};
  nodes[index] = {
    children: children,
    post: buildPost(index),
  };
  const body = {
    "add-nodes": {
      resource: { name: "my-urbit-notes", ship: `~${props.ship}` },
      nodes: nodes,
    },
  };
  urbitVisor
    .poke({ app: "graph-store", mark: "graph-update-3", json: body })
    .then((res) => console.log(res));
}
```

As can be noted from the code above, `graph-store` data structures are a bit complicated, and furthermore notebook posts are the most complicated of them all. This is because they enable you to commit edits yet still retain the revision history.

Explaining the `graph-store` node structure is beyond the scope of this guide, however you can check out the very detailed [official documentation](https://urbit.org/docs/userspace/graph-store/overview) on the design of `graph-store` for more details.

Nonetheless, you can still continue forward without a perfect understanding of how `graph-store` works yet and still get by. Let's now add a simple text composer to write posts.

Clicking the "post" button will call the `addNotebookPost` function and save our posts to Urbit. We'll define two variables, one for the note title and one for the note text body:

```tsx
const [title, setTitle] = useState("");
const [text, setText] = useState("");
```

```tsx
    <div className="notebook">
      <header>
        <h1>My Urbit Notes</h1>
      </header>
      <div className="composer">
        <div className="row-1">
          <input
            type="text"
            value={title}
            placeholder="Note Title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={addNotebookPost}>New post</button>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        {loading && spinner}
      </div>
```

Now that we have sent a `poke` with our post, a likely question pops up. Where is our post, how do we verify that our `poke` was successful, and how do we show it to the user?

As we mentioned earlier, `pokes` are unidirectional; they send data to Urbit, and get nothing in return except an acknowledgment (an "ack") of receipt. The `urbitVisor.poke` response, if successful, will be an auto-generated number which represents the number of actions we have sent to our Urbit ship in our current session.

We could simply reload the app and scry for the contents again, howerver that is very sub par user experience. Ideally we want a way for updates to take effect in our UI in real time.

Urbit enables that through the use of subscriptions. We can use Urbit Visor to `subscribe` to a resource, which in other words means set up a pub-sub connection to the user's Urbit server so that every update is sent back to our web app.

## Subscriptions

Subscriptions are used heavily in Urbit code; Urbit apps and even kernel nodes most often do not request data and process the responses; they instead subscribe to each other, and send data to subscribers in an async fashion. There are many technical reasons for that which are out of the scope of this guide.

As we mentioned previously, subscriptions are not required for a simple notes app with a single user (scries work as well for this use case), but Urbit subscriptions are an important topic that every developer should be familiar with, so we shall dive into them here.

Subscriptions are similar to scries, in that they consume data, but instead of following a request-response pattern, they work throught the pub-sub, publish-subscribe pattern. You subscribe to a resource, and that resource sends data whenever it has anything to send. In HTTP terms this works through an EventSource connection, also known as "server-side events". Unlike Websockets, EventSource is pure HTTP, and has very little overhead.

Urbit Visor takes care of the implementation details entirely for you, so to create a subscription you only need to call `urbitVisor.subscribe`.

For our notes app we will do the following:

```ts
useEffect(()=>, {
  urbitVisor.subscribe({app: "graph-store", path: "/updates"});
},[])
```

Do note, `urbitVisor.subscribe` takes the same arguments as `urbitVisor.scry`. The argument is a single object with two keys, `app`, for the Urbit app we want to subscribe to, and `path`, the subscription path. The subscription path follows the same format as a `scry` path (a list of words separated by a forward slash).

In our current case, we want to subscribe to all updates from `graph-store`, which are published at the path `/updates`. Like `urbitVisor.poke`, `urbitVisor.subscribe` will return an auto-generated number if successful. You should store this number for later as you will pass it to `urbitVisor.unsubscribe` when you want to end the subscription.

Subscriptions should be setup at a core level of your application, as more often than not you will have multiple components using the data received from a subscription. In our case we will put `urbitVisor.subscribe` inside the `useEffect()` function at `Notebook.tsx`.

Speaking of which, we set up the subscription, and received a response confirming the subscription was successful, but how do we actually get the updates from the subscription? To do this we need a receiving end for the `EventStream` of updates sent by the user's Urbit server.

To handle subscription updates we use the `urbitVisor.on()` endpoint. This can get a bit involved so let's run through it in detail in the following section.

## Handling subscription updates: the `.on` listener.

Subscriptions will send events whenever they occur. In order to receive those events, you need to setup a listener. Urbit Visor listeners work through the `urbitVisor.on` function.

`urbitVisor.on` takes three arguments:

- `EventType`
- `key[]`
- `callback`

`EventType` is an `UrbitVisorEventType`; a string which indicates the sort of event we want to listen to. EventTypes are defined as:

```ts
export type UrbitVisorEventType = UrbitVisorInternalEvent | UrbitEvent;
type UrbitVisorInternalEvent =
  | "connected"
  | "disconnected"
  | "permissions_granted"
  | "permissions_revoked";
type UrbitEvent = "sse" | "poke_success" | "poke_error" | "subscription_error";
```

As you can see, there are two types of events: Visor internal events, and Urbit events proper. Visor internal events are events sent by Urbit Visor itself, related to functionality of the Visor, i.e. when a ship is connected or disconnected, and when permissions are granted or revoked. These events can be useful for more complicated apps such as Urbit Dashboard, so that e.g. your UI can update automatically when the ship connected to Visor changes. They are also used under the hood by `urbitVisor.require` to setup the initial app boilerplate and ensure a smooth user experience.

Most interesting for our purposes here are Urbit Events. `sse` is a "server-side event", i.e. any normal data sent through an Urbit subscription. `sse` is what will be using here, and virtually any Urbit Visor application will have to set a `sse` listener using `urbitVisor.on`. The other event types such as `poke_error` or `subscription_error` are useful for error handling.

The second argument taken by `urbitVisor.on` is an array of strings. This is not strictly necessary, thus you can always pass an empty array. However, due to the nature of native Hoon data structures, it is often the case that json data sent by Urbit is heavily nested, and that can be cumbersome to handle in the frontend. We saw this clearly earlier in the `scry` section with how `graph-store/keys` returns an object with the structure `{"graph-update": {"keys": [key1, key2...]}}`.

If you know what particular piece of data you are looking for, you can pass the series of object keys to `urbitVisor.on` e.g. `["graph-update", "keys"]`. Urbit Visor will then traverse the object automatically for you and return the exact piece of data you wanted.

Furthermore, the array of keys is also useful if you have more than one subscription running at the same time. You can setup multiple `.on` listeners, passing a different array of keys to each, thereby resulting in cleaner code separation compared to running a `switch` statement on `Object.keys(data)[0]` as you would otherwise.

All this takes some time to get used to, so if you are starting with Urbit Visor you probably want to pass an empty array at first until you have more practice.

The third argument for the `.on` listener is a callback function. That function should take one argument, `data`, which will be the json data sent by Urbit through the subscription. Think of it as the callback you pass to a `.then()` function after a JavaScript promise. The callback will be run everytime new data comes through the subscription, so you can handle the data as you receive it.

You can setup one single listener to handle all your subscriptions, and do branching inside the callback, or multiple listeners to handle different types of incoming data.

Depending on the app and path, subscriptions often return data (often the whole state of the app) immediately after being established. As such it is key to set up an `urbitVisor.on` listener before sending a subscription request, or you will likely miss the initial data which gets pushed over the subscription.

Let's add our listener just above our subscription inside the `useEffect` function.

```ts
useEffect(()=>, {
  urbitVisor.on("sse", ["graph-update", "add-nodes"], handleAddNodes)
  urbitVisor.subscribe({app: "graph-store", path: "/updates"});
},[]);
function handleAddNodes(data: any) => {
  setPosts({...posts, ...data})
}
```

We are subscribing to `"graph-store/updates`. The events sent by that subscription are always objects with one key, `graph-update`, and then some other data, depending on the event.

We want to listen to new posts, and events sent when graph-store receives a new post send an object with one key, `add-nodes`, under the `graph-update` key we just mentioned.

A typical `add-nodes` event json looks like this:

```json
{
  "graph-update": {
    "add-nodes": {
      "resource": { "entity": "~darrus-landes", "name": "general" },
      "nodes": {
        "/170141184505437954580853975630187855872": {},
        "/170141184505437981999402951659273322496": {},
        "/170141184505437991538876453909696610304": {},
        "/170141184505438036257758233777827479552": {},
        "/170141184505438055050788867910500614144": {}
      }
    }
  }
}
```

That's an ordered map of `graph-store` nodes. We will need to add some logic later to convert the data structure returned by graph-store to array of posts for our React frontend to render.

The code above makes sure that `data["graph-update"]["add-nodes"]` gets sent to the `handleAddNodes` function, and any other event gets ignored. `handleAddNodes` will then update the `posts` variable, adding the new posts we just received. As we didn't have any posts yet, the `posts` variable was an empty object to begin with.

Let's now add some rendering logic to display our Notebook posts.

The data structures we are getting from `graph-store` are graphs, ordered objects with numerical keys. We will need to convert that data structure into a JavaScript array so React can render the posts. We'll create a `graphToList` function to translate the data structure sent by Urbit `graph-store` into something more ergonomic for the frontend, and a subcomponent, `PostPreview` to display that data.

```tsx
  function graphToList(graph: Graph): Post[] {
    const nodes = Object.keys(graph).map((index) => graph[index]);
    const notDeleted = nodes.filter((node) => typeof node.post !== "string"); // filter out deleted posts
    return notDeleted
      .map((node) => {
        const revisions = node.children["1"].children; // look at the post revisions and choose the latest version to display
        const last = Object.keys(revisions).reduce(
          (acc, cur) => (parseInt(acc) > parseInt(cur) ? acc : cur),
          "0"
        );
        const indexString = revisions[last].post.index.split("/")[1];
        return {
          index: BigInt(indexString),
          contents: revisions[last].post.contents,
          author: revisions[last].post.author,
          date: revisions[last].post["time-sent"],
          revisions: revisions,
        };
      })
      .reverse(); // graphs are already ordered descending by index, reverse it so new notes show up first
  }
const [selected, setSelected] = useState<Post>(null);
function select(post: Post) {
  // make the new-post composer become an edit box when clicked on a post; restore when clicking again on the same post
  if (selected?.index === post.index) {
    setSelected(null);
    setTitle("");
    setText("");
  } else {
    setSelected(post);
    setTitle((post.contents[0] as TextContent).text);
    setText((post.contents[1] as TextContent).text);
  }
}
return (
  <div className="notebook">
    <header>
      <h1>My Urbit Notes</h1>
    </header>
    <div className="composer">
      <div className="row-1">
        <input
          type="text"
          value={title}
          placeholder="Note Title"
          onChange={(e) => setTitle(e.target.value)}
        />
        {!selected && <button onClick={addNotebookPost}>New post</button>}
        {selected && <button onClick={editPost}>Edit post</button>}
      </div>
      <textarea
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      {loading && spinner}
    </div>
    <div className="post-list">
      <div className="post-preview post-preview-header">
        <div className="post-preview-title">
          <p>Note Title</p>
        </div>
        <div className="post-preview-date">
          <p>Last Modified</p>
        </div>
      </div>
      {graphToList(posts).map((post: Post) => {
        return <PostPreview key={post.index} post={post} select={select} />;
      })}
    </div>
  </div>
);
interface PostProps {
  post: Post;
  select: (post: Post) => void;
}
function PostPreview(props: PostProps) {
  function showPost() {
    props.select(props.post);
  }
  return (
    <div className="post-preview">
      <div onClick={showPost} className="post-preview-title">
        <p>{(props.post.contents[0] as TextContent).text}</p>
      </div>
      <div className="post-preview-date">
        <p>{new Date(props.post.date).toLocaleDateString()}</p>
        <p>{new Date(props.post.date).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
```

Your Urbit Notes should now display below the composer in rows of two columns, with the note title at the left and the date and time of writing at the right. We also added a `select` function, so that clicking on one row of the note list selects a note. Selected notes will display their content on the note composer.

This way we can do without a page router in our app, making it fast and easy to read your notes in a single page. This also enable us to edit posts on the fly, again without having to change pages or click 5 times. Urbit Notes is all about speed and ease.

Editing notes however introduces some complexity in our data handling.

## Editing posts

`graph-store`, the built in social database of Urbit, has as of present (February 2022), four different built-in schemas:

- chats
- collections
- feeds
- notebooks

Of these, notebooks are the most complicated as they allow editing existing data, which you can't do in a chat.

`graph-store` notebooks however don't just overwrite the old data, but instead always add data on top so all revisions remain in the database. This feature is in fact a bit overkill for our small Notes application, but in order to use the post editing functionality we need to understand `graph-store` data structures. This is further the case especially as we want to have real-time updates, which can be tricky with React.

To reiterate, the inner-works of state flow in React and data immutability in `graph-store` are beyond the scope of this guide. We aim to explain how to use Urbit Visor for building web apps yourself, however it also behooves us to show some common patterns that most developers will likely encounter.

You will recall that when launching Urbit Notes, we scried the `my-urbit-notes` notebook and stored that data into the state variable `posts` , using `useState`. That worked fine, however now if we want to edit posts, we are not merely adding or subtracting items to a list. Instead we are modifying a rather complex and deeply nested data structure.

`useState` won't work properly for this use case, and as such we will need to use the React hook `useReducer` and declare all of the data transformations that we expect to happen in our app in advance.

Let's add the reducer to our `Notebook` component:

```ts
const postReducer = (state: Graph, action) => {
  switch (action.type) {
    case "add-post":
      const nod = Object.entries(action.payload).map((entry) => {
        const key = entry[0].replace("/", ""); //  add-graph object keys (produced by the initial scry) don't take a leading "/", while add-nodes keys do, we handle the inconsistency here
        return [key, entry[1]];
      });
      const nodes = Object.fromEntries(nod);
      return { ...state, ...nodes };
    case "delete-post":
      const { [action.payload]: deletedPost, ...rest } = state;
      return rest;
    case "edit-post":
      const index = Object.keys(action.payload)[0];
      const base_index = Object.keys(action.payload)[0].split("/")[1];
      const revision = Object.keys(action.payload)[0].split("/")[3];
      const post = state[base_index];
      post.children["1"].children[revision] = action.payload[index];
      const editedPost = {};
      editedPost[base_index] = post;
      return { ...state, ...editedPost };
  }
};
const initialPosts: Graph = {};
const [posts, setPosts] = useReducer(postReducer, initialPosts);
```

As exemplified by our switch statement, there are only three things that can happen to a note:

- creation
- deletion
- editing

As such we define the ways we modify the state of the app depending on the action called. Likewise we also have to modify our data handlers to use the new reducer logic.

```ts
useEffect(() => {
  urbitVisor
    .scry({
      app: "graph-store",
      path: `/graph/~${props.ship}/my-urbit-notes`,
    })
    .then((res) => {
      setPosts({
        type: "add-post",
        payload: res.response["graph-update"]["add-graph"]["graph"],
      });
      setLoading(false);
    });
  urbitVisor.on("sse", ["graph-update", "add-nodes"], handleAddNodes);
  urbitVisor.on("sse", ["graph-update", "remove-posts"], handleRemovePosts);
  urbitVisor.subscribe({ app: "graph-store", path: "/updates" });
}, []);
function handleAddNodes(data: any) {
  setLoading(false);
  if (Object.keys(data.nodes)[0].split("/").length > 3)
    //  if it's an update about an edited post, go update the post
    setPosts({ type: "edit-post", payload: data.nodes });
  else setPosts({ type: "add-post", payload: data.nodes }); // if it's an update about a new post, go add the post to the post list
}
function handleRemovePosts(data: any) {
  setLoading(false);
  const [index] = data.indices;
  setPosts({ type: "delete-post", payload: index.replace("/", "") });
}
```

Moving forward, we also need to set the actual function that edits posts which are called from the markup.

To continue in the spirit of minimalism, we will encode the logic such that if you empty the title and text of a post and click on "Edit Post", the post is deleted. If there's any content in the composer, the post is edited. You don't want to delete a precious note just by having fat fingers and clicking on the wrong button.

```ts
function editPost() {
  if (title === "" && text === "") deletePost();
  else modifyPost();
}
function deletePost() {
  setLoading(true);
  const body = {
    "remove-posts": {
      resource: {
        ship: `~${props.ship}`,
        name: "my-urbit-notes",
      },
      indices: [`/${selected.index}`],
    },
  };
  urbitVisor
    .poke({ app: "graph-store", mark: "graph-update-3", json: body })
    .then((res) => console.log(res));
}
function modifyPost() {
  setLoading(true);
  const last: number = Object.keys(selected.revisions).reduce(
    //  finds the latest revision of the post and increments it.
    (acc: number, item: string) =>
      acc > parseInt(item) ? acc : parseInt(item),
    0
  );
  const index = `/${selected.index}/1/${last + 1}`;
  const contents = [{ text: title }, { text: text }];
  const nodes = {};
  nodes[index] = {
    children: null,
    post: buildPost(`${index}`, contents),
  };
  const body = {
    "add-nodes": {
      resource: { name: "my-urbit-notes", ship: `~${props.ship}` },
      nodes: nodes,
    },
  };
  urbitVisor
    .poke({ app: "graph-store", mark: "graph-update-3", json: body })
    .then((res) => console.log(res));
}
```

And that's it, our Urbit Notes webapp is now complete!
![image showing empty notebook](assets/notebook.png)

## Conclusion

Getting started developing in the Urbit ecosystem can be rather complicated, but thanks to Urbit Visor the vast majority of that complexity is smoothed over on the TS/JS side. This provides a drastically simpler experience for developers such as yourself who now can spend time learning Urbit's idiosyncratic facets.

Rather than focusing on dealing with 5000 different edge cases and lower level implementation details, you can now focus back on the important part of your application which users will actually feel; the frontend and business logic.

Through Urbit Notes we have introduced you to the world of building Urbit Web Apps which will seamlessly enable end users to utilize their personal Urbit ship as a novel p2p Web3 backend. This is the first stepping stone for building out a new future of the web, wherein each user truly owns their own data and identity.

Check out the final code of Urbit Notes at https://github.com/dcSpark/urbit-notes/tree/main/webapp

You are free to clone the repo and modify it to your own taste.

In the coming weeks we will be releasing a following guide taking you through how to build UV Extensions; Urbit Visor-powered chrome web extensions. This will open up a whole new layer to Web3, wherein Visor truly starts to become a meta-layer that lives on top of the existing web which enables seamless integration between Urbit and every website you know and love.

### Disclaimer

It is important to note that while Urbit Visor exposes the user's Urbit ship seamlessly, it cannot be used to authenticate the user without using a more advanced protocol on top such as [Authenticate With Urbit ID](https://github.com/dcSpark/authenticate-with-urbit-id).

Allowing users to login to Web2 sites/services must go through a secure authentication protocol, or else hackers/bad actors can easily spoof the identity of users and login into their accounts on said services. As such, building Urbit Web Apps, UV Extensions, and Urbit integrations into Blockchain dApps which do not rely on a web2 backend is the easiest route without having to worry about attack vectors. Interoping with the old Web2 world is inherently a lot more dangerous, and as such requires [authentication protocols](https://github.com/dcSpark/authenticate-with-urbit-id) to be secure.


### Credits

**Author:** ~mirtyl-wacdec

**Editor:** ~mocrux-nomdep
