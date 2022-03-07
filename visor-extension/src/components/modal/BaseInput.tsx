import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Urbit from '@urbit/http-api';
import { Command, MenuItem } from './types';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  baseFocus?: Boolean;
  commands?: MenuItem[];
  filteredCommands?: (commands: MenuItem[]) => void;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  schemaArgs?: any[];
  refs?: (refs: any) => void;
}

const BaseInput = (props: InputProps) => {
  const baseInput = useRef(null);
  const [commands, setCommands] = useState(props.commands);

  useEffect(() => {
    if (props.baseFocus) baseInput.current.focus();
  }, [props.baseFocus]);

  useEffect(() => {
    baseInput.current.focus();
  }, [baseInput]);

  const handleInputChange = (change: any) => {
    console.log(change.target.value);
    if (change.target) {
      const inp = change.target.value.toLowerCase();

      if (inp.length > 0) {
        const filtered = commands.filter(command => command.title.toLowerCase().includes(inp));

        if (commands.length == filtered.length) {
          console.log('same');
        } else {
          props.filteredCommands(filtered);
        }
      } else {
        props.filteredCommands(commands);
      }
    }
  };

  return (
    <input
      ref={baseInput}
      onChange={(change: any) => handleInputChange(change)}
      contentEditable
      className="cl-base-input"
      placeholder="Type..."
    />
  );
};

export default BaseInput;
