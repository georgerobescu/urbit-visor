import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import { MenuItem } from './types';

interface MenuOptionProps {
  handleSelection: (command: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  commands: MenuItem[];
  contextItems: MenuItem[];
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);

  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (
      props.keyDown.key === 'ArrowDown' &&
      clickedIndex < (props.contextItems ? props.contextItems.length : props.commands.length) - 1
    ) {
      setClickedIndex(clickedIndex + 1);
      props.handleSelection(
        props.contextItems ? props.contextItems[clickedIndex + 1] : props.commands[clickedIndex + 1]
      );
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
      {(props.commands ? props.commands : props.contextItems).map((option, index) => (
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
