import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { urbitVisor } from '@dcspark/uv-core';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';
import Input from '../Input';
import { Command, MenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
}

const ScryInput = (props: InputProps) => {
  return <Input {...props} />;
};

export default ScryInput;
