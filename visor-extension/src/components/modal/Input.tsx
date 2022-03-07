import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Urbit from '@urbit/http-api';
import { Command } from './types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  schemaArgs?: any[];
  refs?: (refs: any) => void;
  response?: Boolean;
  inputChange?: (change: any) => void;
}

const Input = (props: InputProps) => {
  const inputRef = useRef([]);
  const [currentFocus, setCurrentFocus] = useState(null);

  const selection = (window as any).getSelection();

  useEffect(() => {
    const ref = inputRef;
    return () => {
      ref.current = [];
    };
  }, [props.selectedToInput]);

  useEffect(() => {
    inputRef.current[0].focus();
    setCurrentFocus(0);
    props.refs ? props.refs(inputRef) : null;
  }, [inputRef]);
  useEffect(() => {
    if (!props.nextArg) {
      return;
    } else if (inputRef.current[currentFocus + 1]) {
      inputRef.current[currentFocus + 1].focus();
      setCurrentFocus(currentFocus + 1);
    }
  }, [props.nextArg]);
  useEffect(() => {
    if (!props.previousArg) {
      return;
    } else if (inputRef.current[currentFocus - 1]) {
      inputRef.current[currentFocus - 1].focus();
      setCurrentFocus(currentFocus - 1);
    }
  }, [props.previousArg]);

  useEffect(() => {
    console.log(inputRef.current);
    if (!props.sendCommand) return;
    else if (inputRef.current.every(el => (el?.innerHTML ? true : false))) {
      if (props.refs) {
        props.refs(inputRef.current.map(ref => ref.innerHTML));
      }
      let args: any[];
      if (!props.schemaArgs) {
        args = inputRef.current;
      } else {
        args = props.schemaArgs.map(arg => (arg == 'default' ? inputRef.current : arg));
      }
      console.log(args);
      const f = async () => {
        for (const [i, message] of props.selectedToInput.schema.entries()) {
          console.log(message);
          const data = { action: props.selectedToInput.command, argument: message(args) };
          console.log(data);
          const res = await Messaging.sendToBackground({ action: 'call_airlock', data: data });
          props.response == true || props.response == undefined
            ? handleAirlockResponse(res)
            : void console.log(res);
          //console.log(message(props.selected.schemaArgs ? args[i] : args))
        }
      };
      f();
      inputRef.current.forEach(input => {
        input.innerHTML = '';
      });
      inputRef.current[0].focus();
      setCurrentFocus(0);
    } else {
      console.log('not sending poke');
      inputRef.current.forEach(input => {
        if (input?.innerHTML == '') input.classList.add('highlight-required');
      });
    }
  }, [props.sendCommand]);

  const handleAirlockResponse = (res: any) => {
    if (props.selectedToInput.command == 'poke') {
      res.status !== 'error'
        ? props.airlockResponse('poke sucessful')
        : props.airlockResponse('poke error');
    } else props.airlockResponse(res);
  };

  return (
    <div className="cl-input">
      {/* <div>{props.selected?.title}</div> */}
      <div className="inputs-wrapper">
        {props.selectedToInput.arguments.map((arg: string, i: number) => (
          <div
            key={i}
            className="arg-input"
            contentEditable="true"
            data-placeholder={arg}
            onKeyUp={(event: React.KeyboardEvent) => {
              if ((props.inputChange && event.key.length == 1) || event.key == 'Backspace')
                props.inputChange(event);
            }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key == 'Backspace' && (event.target as Element).innerHTML == '') {
                props.clearSelected(true);
              } else if ((event.target as Element).classList.contains('highlight-required')) {
                (event.target as Element).classList.remove('highlight-required');
              } else {
                return;
              }
            }}
            ref={el => (inputRef.current[i] = el)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Input;
