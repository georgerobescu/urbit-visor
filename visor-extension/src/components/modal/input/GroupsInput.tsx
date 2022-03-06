import React, { useCallback, useMemo } from 'react';
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
  selectedToInput: MenuItem;
  selected: MenuItem;
}

const GroupsInput = (props: InputProps) => {
  const [our, setOur] = useState(null);
  const [url, setUrl] = useState(null);
  const [contextItems, setContextItems] = useState([] as ContextMenuItem[]);
  const [groups, setGroups] = useState([] as ContextMenuItem[]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    window.addEventListener('message', handleResponse);
    return () => {
      window.removeEventListener('message', handleResponse);
    };
  });

  useEffect(() => {
    let isSubscribed = true;
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      if (isSubscribed) {
        setOur(res.active.shipName);
        setUrl(res.airlock.url);
      }
    });
    return () => {
      isSubscribed = false;
    };
  });

  useEffect(() => {
    let number = 0;
    const subscription = urbitVisor.on('sse', ['metadata-update', 'associations'], handleResponse);

    const setData = () => {
      urbitVisor.subscribe({ app: 'metadata-store', path: '/all' }).then(res => {
        number = res.response;
      });
    };
    urbitVisor.require(['subscribe'], setData);
    return () => {
      urbitVisor.off(subscription);
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
    setGroups(groups);

    console.log(groups);
    props.contextItems(groups);
  };

  const handleInputChange = (change: any) => {
    if (change.target) {
      const inp = change.target.innerText.toLowerCase();

      if (inp.length > 0) {
        const filtered = groups.filter(group => group.title.toLowerCase().includes(inp));

        if (contextItems.length == filtered.length) {
          console.log('same');
        } else {
          setContextItems(filtered);
        }
      }
    }
  };

  useEffect(() => {
    if (contextItems) props.contextItems(contextItems);
  }, [contextItems]);

  useEffect(() => {
    let isSubscribed = true;

    if (props.sendCommand) {
      const data = { url: `${url}/apps/landscape/~landscape/ship/${props.selected.title}` };
      Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data }).then(
        res => {
          if (isSubscribed) {
            console.log(res);
          }
        }
      );
      props.clearSelected(true);
    }

    return () => {
      isSubscribed = false;
    };
  }, [props.sendCommand]);

  let input;

  if (props.sendCommand) {
    input = <></>;
  } else {
    input = (
      <Input {...props} response={false} inputChange={(change: any) => handleInputChange(change)} />
    );
  }

  return input;
};

export default GroupsInput;
