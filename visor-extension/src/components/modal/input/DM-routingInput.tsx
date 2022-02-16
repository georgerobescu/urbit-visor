import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import RoutingInput from '../RoutingInput';
import { Command } from '../types';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
}

const DMInput = (props: InputProps) => {
  const [refs, setRefs] = useState(null);
  const [url, setUrl] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [targetContent, setTargetContent] = useState(null);

  useEffect(() => {
    if (refs)
      setRouteData({
        url: `http://localhost:8080/apps/landscape/~landscape/messages/dm/${refs[0]}`,
        target: props.selected?.routingTarget,
        targetContent: refs[1],
      });
  }, [refs]);
  useEffect(() => {
    console.log(routeData);
  }, [routeData]);
  return <RoutingInput {...props} refs={(res: any) => setRefs(res)} routeData={routeData} />;
};

export default DMInput;
