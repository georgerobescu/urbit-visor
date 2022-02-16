import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { urbitVisor } from '@dcspark/uv-core';
import { Messaging } from '../../../messaging';
import Urbit from '@urbit/http-api';

interface InputProps {
  nextArg: Boolean;
  sendCommand: Boolean;
}

const BitcoinInput = (props: InputProps) => {
  const shipInput = useRef(null);
  const amountInput = useRef(null);
  const [currentFocus, setCurrentFocus] = useState(null);

  const selection = (window as any).getSelection();

  useEffect(() => {
    shipInput.current.focus();
    setCurrentFocus('ship');
  }, [shipInput]);
  useEffect(() => {
    if (!props.nextArg) {
      return;
    } else if (currentFocus == 'ship') {
      amountInput.current.focus();
      setCurrentFocus('amount');
    }
  }, [props.nextArg]);

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
          ].join('\n'),
        }}
      ></style>
      <div>bitcoin:</div>
      <div>
        <div
          className="div-input"
          contentEditable="true"
          style={inputStyle}
          data-placeholder="ship"
          ref={shipInput}
        ></div>
      </div>
      <div>
        <div
          className="div-input"
          contentEditable="true"
          style={inputStyle}
          data-placeholder="amount"
          ref={amountInput}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key == 'Backspace' && (event.target as Element).innerHTML == '') {
              shipInput.current.focus();
              event.preventDefault();
              setCurrentFocus('ship');
              selection.setPosition(selection.focusNode, selection.focusNode.length);
            }
          }}
        ></div>
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

export default BitcoinInput;
