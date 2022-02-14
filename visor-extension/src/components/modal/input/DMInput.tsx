import React from "react";
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from "react";
import { Messaging } from "../../../messaging";
import Urbit from "@urbit/http-api";
import Input from "../Input";
import { Command } from "../types";

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
}

const DMInput = (props: InputProps) => {

  const [refs, setRefs] = useState(null)
  const our = 'bicnub-lorlec-ramsyx-fordec--dasdux-hocnep-monmel-samzod'
  const schemaArgs = [our, 'default', 'default']

  useEffect(() => {
     if (refs) {
      const data = { url: `http://localhost:8080/apps/landscape/~landscape/messages/dm/${refs[0]}` }
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data}).then(res => console.log(res));
    }},
    [refs])

  return (
  <Input {...props} schemaArgs={schemaArgs} refs={(res: any) => setRefs(res)} />
  )
};

export default DMInput;
