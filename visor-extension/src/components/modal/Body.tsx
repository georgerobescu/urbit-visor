import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import Menu from './Menu';
import Display from './Display';
import { ContextMenuItem, MenuItem } from './types';

interface BodyProps {
  contextItems?: ContextMenuItem[];
  handleSelection: (command: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  airlockResponse: any;
  firstSelected: Boolean;
  commands: MenuItem[];
}

const Body = (props: BodyProps) => {
  return (
    <div className="command-launcher-body">
      <Menu
        commands={props.commands}
        selected={props.selected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
        contextItems={props.contextItems}
        firstSelected={props.firstSelected}
      />
      <Display selected={props.selected} airlockResponse={props.airlockResponse} />
    </div>
  );
};

export default Body;
