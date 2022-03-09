import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import BaseInput from '../BaseInput';

import { Command, MenuItem, ContextMenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
  changeSelected: (selected: Command) => void;
  contextItems: (items: ContextMenuItem[]) => void;
  commands?: MenuItem[];
  setCommands?: (commands: MenuItem[]) => void;
  argPreview?: (preview: Boolean) => void;
}

const HistoryInput = (props: InputProps) => {
  const [url, setUrl] = useState(null);
  const [focus, setFocus] = useState(null);
  const [commands, setCommands] = useState(props.commands);

  useEffect(() => {
    let i = true;
    if (i) {
      Messaging.sendToBackground({ action: 'get_command_history' }).then(res => {
        props.setCommands(
          res.commandHistory.map((item: { command: string; arguments: string[] }) => {
            let command = commands.filter(
              (command: Command) => command.title == item.command
            )[0] as Command;

            command.prefilledArguments = item.arguments;

            return command;
          })
        );
      });
      props.argPreview(true);
    }
    return () => {
      i = false;
    };
  }, [commands]);

  return <BaseInput {...props} />;
};

export default HistoryInput;
