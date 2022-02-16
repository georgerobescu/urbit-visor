import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import { Command } from './types';

interface MenuOptionProps {
  handleSelection: (command: Command) => void;
  keyDown: React.KeyboardEvent;
  selected: Command;
  commands: Command[];
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);

  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (props.keyDown.key === 'ArrowDown' && clickedIndex < props.commands.length - 1) {
      setClickedIndex(clickedIndex + 1);
      props.handleSelection(props.commands[clickedIndex + 1]);
    } else {
      return;
    }
  }, [props.keyDown]);
  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (props.keyDown.key === 'ArrowUp' && clickedIndex > 0) {
      setClickedIndex(clickedIndex - 1);
      props.handleSelection(props.commands[clickedIndex - 1]);
    } else {
      return;
    }
  }, [props.keyDown]);

  return (
    <div className="command-launcher-menu-list">
      {props.commands.map((option, index) => (
        <div
          className="command-launcher-menu-option"
          style={
            !props.selected
              ? { ...listItemStyle, border: 'none' }
              : index == clickedIndex
              ? { ...listItemStyle, border: 'outset' }
              : { ...listItemStyle, border: 'none' }
          }
          key={index}
        >
          {option.title}
        </div>
      ))}
    </div>
  );
};

const listItemStyle: CSS.Properties = {
  margin: '12px',
  fontSize: '18px',
};

export default MenuOptions;
