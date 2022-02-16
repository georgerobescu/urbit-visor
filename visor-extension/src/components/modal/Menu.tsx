import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import MenuOptions from './MenuOptions';
import { Command } from './types';

interface MenuOptionProps {
  handleSelection: (command: Command) => void;
  keyDown: React.KeyboardEvent;
  selected: Command;
  commands: Command[];
}

const Menu = (props: MenuOptionProps) => {
  return (
    <div style={divStyle} className="command-launcher-menu">
      <MenuOptions
        commands={props.commands}
        selected={props.selected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
      />
    </div>
  );
};

const divStyle: CSS.Properties = {
  width: '160px',
};

export default Menu;
