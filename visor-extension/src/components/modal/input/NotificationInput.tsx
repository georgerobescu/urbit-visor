import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import BaseInput from '../BaseInput';

import { Command } from '../types';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
}

const NotificationInput = (props: InputProps) => {
  const [url, setUrl] = useState(null);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      setUrl(res.airlock.url);
    });
  }, [props.selected]);

  useEffect(() => {
    if (url) {
      const data = { url: `${url}/apps/grid/leap/notifications` };
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data }).then(
        res => console.log(res)
      );
    }
  }, [url]);

  return <BaseInput {...props} />;
};

export default NotificationInput;
