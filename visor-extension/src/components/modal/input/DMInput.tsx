import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import { Command, MenuItem } from '../types';
const ob = require('urbit-ob');

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
  landscapeFork: string;
}

const DMInput = (props: InputProps) => {
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
    if (refs?.length) {
      console.log(refs);
      if (ob.isValidPatp(refs)) {
        const data = {
          url:
            props.landscapeFork == 'escape'
              ? `${url}/apps/escape/~escape/messages/dm/${refs}`
              : `${url}/apps/escape/~escape/messages/dm/${refs}`,
        };
        Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data }).then(
          res => console.log(res)
        );
      } else props.airlockResponse('enter valid ship name');
    }
  }, [refs]);

  const handleRefSet = (refs: any) => {
    console.log(refs);
    if (refs.length) {
      if (refs[0].startsWith('~')) {
        setRefs(refs[0]);
      } else {
        setRefs('~' + refs[0]);
      }
    }
  };

  return (
    <Input
      {...props}
      response={false}
      schemaArgs={schemaArgs}
      refs={(res: any) => handleRefSet(res)}
    />
  );
};

export default DMInput;
