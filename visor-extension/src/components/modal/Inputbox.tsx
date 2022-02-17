import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import Urbit from '@urbit/http-api';
import PokeInput from './input/PokeInput';
import ScryInput from './input/ScryInput';
import SubscribeInput from './input/SubscribeInput';
import SpiderInput from './input/SpiderInput';
import TerminalInput from './input/TerminalInput';
import DMInput from './input/DMInput';
import NotificationInput from './input/NotificationInput';

import { Command } from './types';
import Input from './Input';

interface InputProps {
  selected: Command;
  baseFocus: Boolean;
  nextArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
}

const Inputbox = (props: InputProps) => {
  const baseInput = useRef(null);
  useEffect(() => {
    if (!props.selected) baseInput.current.focus();
  }, [props.baseFocus]);

  let command;

  switch (props.selected?.title) {
    case 'poke':
      command = <PokeInput {...props} />;
      break;
    case 'scry':
      command = <ScryInput {...props} />;
      break;
    case 'subscribe':
      command = <SubscribeInput {...props} />;
      break;
    case 'thread':
      command = <SpiderInput {...props} />;
      break;
    case 'terminal':
      command = <TerminalInput {...props} />;
      break;
    case 'message':
      command = <DMInput {...props} />;
      break;
    case 'notifications':
      command = <NotificationInput {...props} />;
      break;
    default:
      command = <input ref={baseInput} className="root-input" type={'text'} />;
  }

  return <div className="modal-input-box">{command}</div>;
};

export default Inputbox;
