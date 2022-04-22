import { Command } from '../types';
import React from 'react';
import terminalIcon from '../../../icons/terminal.svg';

const Icon = () => <img src={terminalIcon} />;

export const Terminal: Command = {
  command: 'poke',
  title: 'Terminal',
  icon: <Icon />,
  description: 'Issue commands to the terminal on your Urbit ship.',
  arguments: ['command'],
  schema: [
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { txt: [props[0].innerText] } }),
    (props: any[]) => ({ app: 'herm', mark: 'belt', json: { ret: null } }),
  ],
};
