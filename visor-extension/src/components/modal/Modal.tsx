import React from "react";
import { useEffect, useState } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import Inputbox from "./Inputbox";
import Body from "./Body";

const Modal = () => {
  const [selected, setSelected] = useState(null);
  const [selectedToInput, setSelectedToInput] = useState(null);
  const [keyDown, setKeyDown] = useState(null);
  const [nextArg, setNextArg] = useState(null);
  const [sendCommand, setSendCommand] = useState(null);

  useEffect(() => {setNextArg(null); setSendCommand(null)}, [nextArg, sendCommand])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key == 'Enter' && selectedToInput !== selected) {
      event.preventDefault();
      setSelectedToInput(selected)
    }
    else if (event.key == 'Enter' && selected == selectedToInput) {
      event.preventDefault();
      setSendCommand(true)
    }
    else if (event.key == ' ' && selected == selectedToInput) {
      event.preventDefault();
      setNextArg(true)
    }
    else {
    setKeyDown(event);
    return
    }
  }
  return (
  <div onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event)} tabIndex={-1}>
    <Inputbox selected={selectedToInput} nextArg={nextArg} sendCommand={sendCommand} />
    <Body handleSelection={(i: String) => setSelected(i)} selected={selected} keyDown={keyDown} />
  </div>
  )
};

export default Modal;
