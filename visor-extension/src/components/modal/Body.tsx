import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import Menu from './Menu';
import Display from './Display';
import { Command } from './types';

interface BodyProps {
  handleSelection: (command: Command) => void;
  keyDown: React.KeyboardEvent;
  selected: Command;
  airlockResponse: any;
  commands: Command[];
}

const Body = (props: BodyProps) => {
  return (
    <div className="command-launcher-body">
      <Menu
        commands={props.commands}
        selected={props.selected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
      />
      <Display selected={props.selected} airlockResponse={props.airlockResponse} />
    </div>
  );
};

export default Body;
