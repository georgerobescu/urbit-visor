import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Urbit from '@urbit/http-api';
import { Command } from './types';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selected: Command;
  routeData: any;
  refs: (refs: any) => void;
}

const RoutingInput = (props: InputProps) => {
  const inputRef = useRef([]);
  const [currentFocus, setCurrentFocus] = useState(null);

  const selection = (window as any).getSelection();

  useEffect(() => {
    const ref = inputRef;
    return () => {
      ref.current = [];
    };
  }, [props.selected]);

  useEffect(() => {
    inputRef.current[0].focus();
    setCurrentFocus(0);
  }, [inputRef]);
  useEffect(() => {
    if (!props.nextArg) {
      return;
    } else {
      inputRef.current[currentFocus + 1].focus();
      setCurrentFocus(currentFocus + 1);
    }
  }, [props.nextArg]);

  useEffect(() => {
    console.log(inputRef.current);
    if (!props.sendCommand) return;
    else if (inputRef.current.every(el => (el?.innerHTML ? true : false))) {
      props.refs(inputRef.current.map(ref => ref.innerHTML));
    } else {
      console.log('not sending poke');
      inputRef.current.forEach(input => {
        if (input?.innerHTML == '') input.classList.add('highlight-required');
      });
    }
  }, [props.sendCommand]);

  useEffect(() => {
    if (props.routeData) {
      Messaging.relayToBackground({
        app: 'command-launcher',
        action: 'route',
        data: props.routeData,
      }).then(res => console.log(res));

      inputRef.current.forEach(input => {
        input.innerHTML = '';
      });
      inputRef.current[0].focus();
      setCurrentFocus(0);
    }
  }, [props.routeData]);

  return (
    <div style={divStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: [
            '.div-input {',
            '  display: inline-block;',
            '  vertical-align: top;',
            '  min-width: 1em;',
            '  padding: 0px 5px 0px 5px;',
            '  cursor: text;',
            '}',
            '.div-input:empty:before {',
            '  content: attr(data-placeholder);',
            '  color: #ccc;',
            '}',
            '.div-input br {',
            '  display: none;',
            '}',
            '.div-input * {',
            '  display: inline;',
            '}',
            '.highlight-required {',
            '  border: red;',
            '  border-style: solid;',
            '  border-width: thin;',
            '}',
          ].join('\n'),
        }}
      ></style>
      <div>{props.selected?.title}</div>
      <div>
        {props.selected.arguments.map((arg: string, i: number) => (
          <div
            key={i}
            className="div-input"
            contentEditable="true"
            style={inputStyle}
            data-placeholder={arg}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key == 'Backspace' && (event.target as Element).innerHTML == '') {
                props.clearSelected(true);
              } else {
                (event.target as Element).classList.remove('highlight-required');
              }
            }}
            ref={el => (inputRef.current[i] = el)}
          ></div>
        ))}
      </div>
    </div>
  );
};

const divStyle: CSS.Properties = {
  display: 'flex',
};
const inputStyle: CSS.Properties = {
  width: 'fit-content',
};

export default RoutingInput;
