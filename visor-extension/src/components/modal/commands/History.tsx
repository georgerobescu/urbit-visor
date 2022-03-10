import { Command } from '../types';
import React from 'react';
import UrbitInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';

export const History: Command = {
  command: '',
  title: 'History',
  description: 'select from previously executed commands',
  arguments: [],
  schema: [],
};
