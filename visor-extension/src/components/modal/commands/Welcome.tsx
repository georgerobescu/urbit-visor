import { Command } from '../types';
import React from 'react';
import urbitTilde from '../../../icons/urbit-tilde.svg';

const Icon = () => <img src={urbitTilde} />;

export const Welcome: Command = {
  title: 'Welcome To Urbit Visor Command Launcher',
  icon: <Icon />,
  description: 'Lorem ipsum dolor etos.',
};
