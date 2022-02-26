import { Command } from '../types';
import React from 'react';
import UrbitInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';

export const Groups: Command = {
  command: '',
  title: 'groups',
  description: 'search from your joined groups and open group page',
  arguments: ['group'],
  schema: [],
};
