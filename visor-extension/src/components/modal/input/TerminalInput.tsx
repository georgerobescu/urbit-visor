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
    let subId: number;
    let number = 0;
    let activeSubs: [any] = [0];

    window.addEventListener('message', handleHerm);

    const setData = () => {
      urbitVisor.subscribe({ app: 'herm', path: '/session//view' }).then(res => {
        console.log(res);
        if (res.response == 'piggyback') {
          setSubscribed(true);
          number = res.subscriber;
        } else {
          number = res.subscriber;
          setSubscribed(true);
        }
      });
    };
    urbitVisor.require(['subscribe'], setData);

    return () => {
      Messaging.sendToBackground({ action: 'active_subscriptions' }).then(res => {
        activeSubs = res.filter((sub: any) => sub.subscription.app == 'herm');
        console.log(activeSubs);
        if (activeSubs.length > 1) {
          console.log(number);
          window.removeEventListener('message', handleHerm);
          Messaging.sendToBackground({ action: 'remove_subscription', data: number }).then(res =>
            console.log(res)
          );
        } else {
          window.removeEventListener('message', handleHerm);
          urbitVisor
            .unsubscribe(activeSubs[0].airlockID)
            .then(res => console.log('unsubscribed terminal'));
        }
      });
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
