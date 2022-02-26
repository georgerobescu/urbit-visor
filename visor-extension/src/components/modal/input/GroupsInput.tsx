import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import { Command } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
}

const GroupsInput = (props: InputProps) => {
  const [refs, setRefs] = useState(null);
  const [our, setOur] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      setOur(res.active.shipName);
      setUrl(res.airlock.url);
    });
  });

  const schemaArgs = [our, 'default', 'default'];

  useEffect(() => {
    if (refs) {
      const data = { url: `${url}/apps/landscape/~landscape/messages/dm/${refs[0]}` };
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data }).then(
        res => console.log(res)
      );
    }
  }, [refs]);

  return (
    <Input {...props} response={false} schemaArgs={schemaArgs} refs={(res: any) => setRefs(res)} />
  );
};

export default GroupsInput;
