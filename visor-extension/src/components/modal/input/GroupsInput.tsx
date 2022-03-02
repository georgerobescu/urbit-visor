import React, { useMemo } from 'react';
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
  const [selectedGroup, setSelectedGroup] = useState(null);

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
      urbitVisor.on('sse', ['metadata-update', 'associations'], handleResponse);

      urbitVisor.subscribe({ app: 'metadata-store', path: '/all' }).then(res => {
        console.log(res);
      });
    };
    urbitVisor.require(['subscribe'], setData);
    return () => {
      window.removeEventListener('message', handleResponse);
      urbitVisor.unsubscribe(number).then(res => console.log(''));
    };
  }, []);

  const handleResponse = (response: Object) => {
    console.log(response);

    const groups = Object.values(response)
      .filter(data => data['app-name'] == 'groups')
      .map(
        group =>
          ({
            commandTitle: 'groups',
            title: (group.group as string).substring(6),
            description: group.metadata.description,
          } as ContextMenuItem)
      );
    setContextItems(groups);

    console.log(groups);
    props.contextItems(groups);
  };

  const handleInputChange = (change: any) => {
    if (change.target) {
      const inp = change.target.innerText.toLowerCase();

      if (inp.length > 0) {
        const filtered = (contextItems as ContextMenuItem[]).filter(group =>
          group.title.toLowerCase().includes(inp)
        );

        props.contextItems(filtered);
      }
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

  return (
    <Input
      {...props}
      response={false}
      refs={(res: any) => setRefs(res)}
      inputChange={(change: any) => handleInputChange(change)}
    />
  );
};

export default GroupsInput;
