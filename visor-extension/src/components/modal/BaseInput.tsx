import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Urbit from '@urbit/http-api';
import { Command } from './types';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  baseFocus?: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
  schemaArgs?: any[];
  refs?: (refs: any) => void;
}

const BaseInput = (props: InputProps) => {
  const baseInput = useRef(null);

  useEffect(() => {
    if (props.baseFocus) baseInput.current.focus();
  }, [props.baseFocus]);

  useEffect(() => {
    baseInput.current.focus();
  }, [baseInput]);

  return <input ref={baseInput} contentEditable className="cl-base-input" placeholder="Type..." />;
};

export default BaseInput;
