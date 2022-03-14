import { Command } from '../types';
import React from 'react';
import UrbitInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';
import dmIcon from '../../../icons/dm.svg';

const Icon = () => <img src={dmIcon} />;

export const DM: Command = {
  command: 'poke',
  title: 'DM',
  icon: <Icon />,
  description: 'send a direct message to a ship',
  arguments: ['ship', 'message'],
  schema: [
    (props: any[]) =>
      addDmMessage(props[0], checkSig(props[1][0].innerHTML), [{ text: props[2][1].innerHTML }]),
  ],
};
function checkSig(innerHTML: any): string {
  if (innerHTML.startsWith('~')) {
    return innerHTML;
  } else {
    return '~' + innerHTML;
  }
}
