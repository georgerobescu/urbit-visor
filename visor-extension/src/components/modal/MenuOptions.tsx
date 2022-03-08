import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import { MenuItem, ContextMenuItem } from './types';

interface MenuOptionProps {
  handleSelection: (menuItem: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  commands: MenuItem[];
  contextItems: ContextMenuItem[];
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);

  useEffect(() => {
    if (props.contextItems) {
      console.log('contextitems rerendered');
      setClickedIndex(-1);
    }
  }, [props.contextItems]);

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
      props.handleSelection(
        props.contextItems ? props.contextItems[clickedIndex - 1] : props.commands[clickedIndex - 1]
      );
    } else {
      return;
    }
  }, [props.keyDown]);

  return (
    <div className="command-launcher-menu-list">
      {(props.contextItems ? props.contextItems : props.commands).map((option, index) => (
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
          {/* <Icon name={option.title.toLowerCase()} /> */}
          {/* <img src={`../../icons/${option.title.toLowerCase()}.svg`} /> */}
          {/* {option.icon} */}
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
