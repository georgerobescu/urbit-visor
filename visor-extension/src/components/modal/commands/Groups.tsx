import { Command } from '../types';
import React from 'react';
import UrbitInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';
import terminalIcon from '../../../icons/terminal.svg';

const Icon = () => <img src={terminalIcon} />;

export const Groups: Command = {
  command: '',
  title: 'Groups',
  icon: <Icon />,
  description: 'Search from your joined groups Lorem Ipsum',
  arguments: ['group'],
  schema: [],
};
