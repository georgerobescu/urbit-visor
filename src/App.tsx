import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import NavBar from "./components/ui/NavBar";
import AddShip from "./components/adding/AddShip"
import ShipList from "./components/list/ShipList";
import ShipShow from "./components/show/ShipShow";
import Permissions from "./components/perms/Permissions";
import PermissionsPrompt from "./components/perms/PermissionsPrompt";
import Settings from "./components/settings/Settings";
import { decrypt, getStorage, storeCredentials, initStorage } from "./storage";
import { EncryptedShipCredentials, BackgroundController, PermissionRequest } from "./types/types";
import { fetchAllPerms, grantPerms } from "./urbit";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory
} from "react-router-dom";
import { LocationDescriptor } from "history";

import "./App.css";

export default function App() {
  const history = useHistory();
  const [first, setFirst] = useState(true);
  const [ships, setShips] = useState([]);
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [perms, setPerms] = useState(null);
  const [shipURL, setShipURL] = useState(null);

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    // TODO automatically wipe active ship if deleted

    // stay in settings if individual settings changed
    if (changes.popup || changes.password && !changes.ships) return
    else setState();
  });



  async function readStorage() {
    return await getStorage(["ships", "password"])
  }
  async function readState(): Promise<any> {
    return new Promise((res, rej) => {
      chrome.runtime.sendMessage({ type: "active" }, state => {
        res(state)
      })
    })
  };

  async function setState() {
    const storage = await readStorage();
    const state = await readState();
    const f = !("password" in storage);
    setFirst(f);
    const s = storage.ships || []
    setShips(s);
    if (state.activeShip) {
      setSelected(state.activeShip);
      setActive(state.activeShip);
    } else{
      setSelected(null)
      setActive(null)
    };
    route(f, s, state)
  }

  function redirect(): LocationDescriptor {
    if (first) return "/welcome"
    else if (active) return "/ship"
    else if (ships) return "/ship_list"
    else return "/add_ship"
  }


  function route(first: boolean, ships: EncryptedShipCredentials[], state: BackgroundController) {
    if (first) history.push("/welcome");
    else if (state.locked) {
      setPrompt("No Ship Connected");
      history.push("/ship_list");
    }
    else if (state.requestedPerms) {
      setPerms(state.requestedPerms);
      history.push("/ask_perms");
    }
    else if (state.activeShip) history.push("/ship");
    else if (ships) history.push("/ship_list");
    else history.push("/add_ship");
  }

  function showShip(ship: EncryptedShipCredentials) {
    setSelected(ship);
  }

  async function saveShip(ship: string, url: string, code: string, pw: string) {
    const creds = await storeCredentials(ship, url, code, pw);
    setSelected(creds);
    const storage = await readStorage();
    setShips(storage.ships);
    route(first, storage.ships, creds);
  }


  function saveActive(ship: EncryptedShipCredentials, url: string): void {
    // first move out of ship show to prevent crashes when activeShip is set to null
    if (ship == null) {
      setPrompt("No ship connected");
      history.push("/ship_list");
    }
    // send message to background script to keep the url in memory
    chrome.runtime.sendMessage({ type: "selected", ship: ship, url: url }, (res) => {
      setPrompt("");
      setState();
    });

  };

  function savePerms(pw: string, perms: PermissionRequest): void {
    const url = decrypt(active.encryptedShipURL, pw);
    grantPerms(active.shipName, url, perms)
  }

  async function setThemPerms(shipURL: string) {
    const perms = await fetchAllPerms(shipURL);
    setPerms(perms.bucket);
    setShipURL(shipURL);
    history.push("/perms")
  }
  useEffect(() => {
    setState();
  }, []);
  return (
    <div className="App">
      <NavBar
        ships={ships}
        selected={selected}
        active={active}
        switchShip={(s: EncryptedShipCredentials) => showShip(s)}
      />
      <div className="App-content">
        <Switch>
          <Route exact path="/">
            <Redirect to={redirect()} />
          </Route>
          <Route path="/welcome">
            <Welcome />
          </Route>
          <Route path="/setup">
            <Setup setFirst={setFirst} />
          </Route>
          <Route path="/add_ship">
            <AddShip add={saveShip} />
          </Route>
          <Route path="/ship_list">
            <ShipList active={active} message={prompt} ships={ships} select={(ship) => setSelected(ship)} />
          </Route>
          <Route path="/ship">
            <ShipShow save={saveActive} active={active} ship={selected} setThemPerms={setThemPerms} />
          </Route>
          <Route path="/perms">
            <Permissions setThemPerms={setThemPerms} shipURL={shipURL} ship={selected} perms={perms} />
          </Route>
          <Route path="/ask_perms">
            <PermissionsPrompt perms={perms} savePerms={savePerms} />
          </Route>
          <Route path="/settings">
            <Settings ships={ships}/>
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </div>
    </div>
  );
}



function DoAddShip() {
  let history = useHistory();
  return (
    <div className="">
      <button onClick={() => history.push("/")} className="add-ship-button">go back</button>
    </div>
  );
}

function Welcome() {
  const history = useHistory();
  return (
    <div className="welcome">
      <img src={logo} className="App-logo" />
      <button onClick={() => history.push("/setup")} className="button add-ship-button">Setup</button>
    </div>
  );
}
interface SetupProps {
  setFirst: (b: boolean) => void
}
function Setup({ setFirst }: SetupProps) {
  const history = useHistory();
  const [pw, setpw] = useState("");
  const [tooltip, setTooltip] = useState(false);
  const [confirmationpw, setconfirmation] = useState("");
  const [error, setError] = useState("");
  function showTooltip(){setTooltip(true)};
  function hideTooltip(){setTooltip(false)};
  function validate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pw === confirmationpw) {
      setError("");
      initStorage(pw)
        .then(res => {
          setFirst(false)
          history.push("/");
        })
    } else {
      setError("Passwords do not match")
    }
  }
  return (
    <div className="setup">
      <p>Please set up a master password
        <span 
          className="tooltip-trigger" 
          onMouseLeave={hideTooltip} 
          onMouseOver={showTooltip}>
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="iconify iconify--clarity" width="18" height="18" preserveAspectRatio="xMidYMid meet" viewBox="0 0 36 36"><path className="clr-i-solid clr-i-solid-path-1" d="M18 6a12 12 0 1 0 12 12A12 12 0 0 0 18 6zm-2 5.15a2 2 0 1 1 2 2a2 2 0 0 1-2.1-2zM23 24a1 1 0 0 1-1 1h-7a1 1 0 1 1 0-2h2v-6h-1a1 1 0 0 1 0-2h4v8h2a1 1 0 0 1 1 1z" fill="currentColor"></path></svg>
        </span> for this extension.</p>
      {tooltip && <div className="tooltip"><p>The password will be used to encrypt the credentials to access your Urbit ships.</p></div>}
      <form onSubmit={validate} className="form">
        <label>Password<input onChange={(e) => setpw(e.currentTarget.value)} type="password" /></label>
        <label>Confirm password<input onChange={(e) => setconfirmation(e.currentTarget.value)} type="password" /></label>
        <p className="errorMessage">{error}</p>
        <button className="button submit-setup-button">Submit</button>
      </form>
    </div>
  );
}
function Welcome2() {
  let history = useHistory();
  return (
    <div className="welcome">
      <img src={logo} className="App-logo" />
      <button onClick={() => history.push("/add_ship")} className="button add-ship-button">Add your Ship</button>
    </div>
  );
}

function ShipAdded() {
  return (
    <div className="">
      <img src={logo} className="App-logo" alt="logo" />
      <h4>
        Ship Added Successfully
      </h4>
    </div>
  );
}

function About(){
  return(
    <div className="modal-background">
      <div className="modal-foreground">
        <p>Login with Urbit Extension</p>
        <p>1.0.0</p>
        <p>Created by:</p>
        <img src="/dcsparklogo.png" alt="" />
        <p>Supported by a grant from</p>
        <p>Urbit Foundation</p>
      </div>
    </div>
  )
}


