import { useState, useEffect } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import { visorAuth } from "./api";
import "./App.css";

function App() {
  useEffect(() => {
    urbitVisor.require(["shipName", "subscribe", "poke"], setData);
  }, []);
  function setData() {
    urbitVisor.getShip().then((res) => {
      setShipname("~" + res.response);
      setMessage(`Hello ~${res.response}. Please confirm your identity`);
    });
  }
  const [message, setMessage] = useState("");
  const [classname, setClassname] = useState("");
  const [shipName, setShipname] = useState("");
  const [buttonString, setButtonString] = useState("Login");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  async function callServer() {
    setButtonString("...");
    setButtonDisabled(true);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const body = JSON.stringify({
      ship: shipName,
    });
    const opts = {
      method: "POST",
      headers: headers,
      body: body,
    };
    const r = await fetch("http://localhost:3333/init", opts);
    const j = await r.json();
    if (j.status === "ok") visorAuth("bus", check);
    else error("b");
  }
  function check(token: string) {
    backendCheck("http://localhost:3333", shipName, token).then((res) => {
      if (res.status === "ok") success(res.count);
      else error("v");
    });
  }

  async function backendCheck(url: string, ship: string, token: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const body = JSON.stringify({
      ship: ship,
      token: token,
    });
    const opts = {
      method: "POST",
      headers: headers,
      body: body,
    };
    const r = await fetch(url + "/check", opts);
    return await r.json();
  }

  function success(count: number) {
    setMessage(
      `Welcome, ${shipName}. You have logged in ${count} times already.`
    );
    setButtonString("Done");
    setButtonDisabled(true);
  }
  function error(m: string) {
    setClassname("error");
    if (m === "b")
      setMessage(
        "The Urbit authentication ship appears to be down, please try again later."
      );
    else if (m === "v")
      setMessage("Identity verification failed. Are you on a fake ship?");
  }

  return (
    <div className="App">
      <h1>Urbit Auth Test</h1>
      <p className={classname}>{message}</p>
      <button disabled={buttonDisabled} type="button" onClick={callServer}>
        {buttonString}
      </button>
    </div>
  );
}

export default App;
