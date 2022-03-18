import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import { MenuItem, ContextMenuItem } from './types';
import classNames from 'classnames/bind';

interface MenuOptionProps {
  handleSelection: (menuItem: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  firstSelected: Boolean;
  commands: MenuItem[];
  contextItems: ContextMenuItem[];
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);

  useEffect(() => {
    setClickedIndex(-1);
  }, [props.contextItems, props.commands]);

  useEffect(() => {
    if (props.firstSelected) {
      setClickedIndex(0);
      props.handleSelection(props.contextItems ? props.contextItems[0] : props.commands[0]);
    }
  }, [props.firstSelected]);

  useEffect(() => {
    console.log('got keydown');
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

  const shortenText = (str: String) => {
    if (str.length > 30) {
      const firstHalf = str.substring(0, 18);
      const secondHalf = str.substring(str.length - 12, str.length);
      return `${firstHalf}…${secondHalf}`;
    }
    return str;
  };

  return (
    <div className="command-launcher-menu-list">
      {(props.contextItems ? props.contextItems : props.commands).map((option, index) => (
        <div
          className={
            !props.selected
              ? 'menu-option'
              : index == clickedIndex
              ? 'menu-option selected'
              : 'menu-option'
          }
          key={index}
        >
          <div className="command-icon">{option.icon}</div>
          <div className="command-text">{shortenText(option.title)}</div>
        </div>
      ))}
    </div>
  );
};

export default MenuOptions;
