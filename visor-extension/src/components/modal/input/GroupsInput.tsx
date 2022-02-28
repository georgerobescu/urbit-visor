import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import { MenuItem, ContextMenuItem } from '../types';
import { urbitVisor } from '@dcspark/uv-core';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  contextItems: (items: ContextMenuItem[]) => void;
  selected: MenuItem;
}

const GroupsInput = (props: InputProps) => {
  const [refs, setRefs] = useState(null);
  const [our, setOur] = useState(null);
  const [url, setUrl] = useState(null);
  const [contextItems, setContextItems] = useState(null);

  useEffect(() => {
    window.addEventListener('message', handleResponse);
    return () => {
      window.removeEventListener('message', handleResponse);
    };
  });

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      setOur(res.active.shipName);
      setUrl(res.airlock.url);
    });
  });

  useEffect(() => {
    let number = 0;
    const setData = () => {
      urbitVisor
        .subscribe({ app: 'group-store', path: '/groups' })
        .then(res => (number = res.response));
    };
    urbitVisor.require(['subscribe'], setData);
    return () => {
      window.removeEventListener('message', handleResponse);
      urbitVisor.unsubscribe(number).then(res => console.log(''));
    };
  }, []);

  const handleResponse = (response: any) => {
    console.log(response);

    if (response.data.event.data.groupUpdate.initial) {
      const groups = Object.keys(response.data.event.data.groupUpdate.initial as Object).map(
        group => ({ title: group, description: '' } as ContextMenuItem)
      );

      console.log(groups);
      props.contextItems(groups);
    }
  };

  useEffect(() => {
    if (props.sendCommand) {
      const data = { url: `${url}/apps/landscape/~landscape/ship/${refs[0]}` };
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data }).then(
        res => console.log(res)
      );
    }
  }, [props.sendCommand]);

  return <Input {...props} response={false} refs={(res: any) => setRefs(res)} />;
};

export default GroupsInput;
