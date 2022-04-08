import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import { urbitVisor } from '@dcspark/uv-core';
import Input from '../Input';
import { Command, MenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
}

const TerminalInput = (props: InputProps) => {
  const [subscribed, setSubscribed] = useState(null);
  const [lines, setLines] = useState([]);

  const selection = (window as any).getSelection();

  useEffect(() => {
    let toSub = true;
    let number = 0;
    if (toSub) {
      window.addEventListener('message', handleHerm);

      const setData = () => {
        urbitVisor.subscribe({ app: 'herm', path: '/session//view' }).then(res => {
          number = res.response;
          setSubscribed(true);
        });
      };
      urbitVisor.require(['subscribe'], setData);
    }
    return () => {
      toSub = false;
      window.removeEventListener('message', handleHerm);
      urbitVisor.unsubscribe(number).then(res => console.log('unsubscribed terminal'));
    };
  }, [props.selectedToInput]);

  const handleHerm = useCallback(
    (message: any) => {
      console.log(message);
      if (
        message.data.app == 'urbitVisorEvent' &&
        message.data.event.data &&
        message.data.event.data.lin
      ) {
        const dojoLine = message.data.event.data.lin.join('');
        if (!(dojoLine.includes('dojo>') || dojoLine[0] === ';' || dojoLine[0] === '>')) {
          setLines(previousState => [dojoLine, ...previousState]);
        } else return;
      }
    },
    [lines]
  );

  useEffect(() => {
    props.airlockResponse(lines);
  }, [lines]);

  return <Input {...props} persistInput={true} response={false} />;
};

export default TerminalInput;
