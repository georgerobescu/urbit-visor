import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import ReactJson from 'react-json-view';
import { MenuItem, Command, ContextMenuItem } from './types';

interface DisplayProps {
  selected: MenuItem;
  airlockResponse: any;
}

const Display = (props: DisplayProps) => {
  const scrollable = useRef(null);

  useLayoutEffect(() => {
    if (scrollable.current.scrollTop > -1)
      scrollable.current.scrollTop = scrollable.current.scrollHeight;
  }, [props.airlockResponse]);

  // Define variable for content which will be held in the display area
  let displayContent;

  // Perform checks to know what to fill the content area with.
  // If airlock response exists
  if (props.airlockResponse) {
    // If the response is an array
    if (Array.isArray(props.airlockResponse)) {
      displayContent = (
        <AirlockSubscriptionResponse
          selected={props.selected}
          airlockResponse={props.airlockResponse}
        />
      );
    }
    // If the response is an object
    else if (typeof props.airlockResponse == 'object') {
      displayContent = (
        <ReactJson style={{ padding: '15px' }} src={props.airlockResponse} enableClipboard={true} />
      );
    }
    // Otherwise
    else {
      displayContent = (
        <div style={{ textAlign: 'center' }}>
          {JSON.stringify(props.airlockResponse)}

          <button
            onClick={event => navigator.clipboard.writeText(JSON.stringify(props.airlockResponse))}
          >
            copy
          </button>
        </div>
      );
    }
  }
  // If no response, display empty
  else {
    displayContent = <SelectionPreview {...props} />;
  }

  // Return the html to be rendered for Display with the content inside
  return (
    <div ref={scrollable} className="command-launcher-display">
      {displayContent}
    </div>
  );
};

// Display the airlock subscription response UI
const AirlockSubscriptionResponse = (props: DisplayProps) => {
  return (
    <div className="airlock-subscription-display">
      {props.airlockResponse.map((line: any, index: number) => (
        <div
          key={index}
          className="airlock-subscription-display-line"
          onClick={event => navigator.clipboard.writeText(JSON.stringify(line))}
        >
          {JSON.stringify(line)}
        </div>
      ))}
    </div>
  );
};

const SelectionPreview = (props: DisplayProps) => {
  const selectedCommand = () => props.selected as Command;
  const selectedContext = () => props.selected as ContextMenuItem;

  let selectionPreviewContent;
  const Icon = selectedCommand()?.icon;

  if (selectedCommand()) {
    selectionPreviewContent = (
      <div className="command-launcher-display-preview-container">
        {/* temporarily comment out */}
        {/* {selectedCommand()?.icon ? <Icon /> : <div></div>} */}
        <div>
          <div>{props.selected.title}</div>
          <div>{props.selected.description}</div>
        </div>
      </div>
    );
  } else if (selectedContext()) {
    selectionPreviewContent = (
      <div className="command-launcher-display-preview-container">context selected</div>
    );
  }
  return <div className="command-launcher-display-preview">{selectionPreviewContent}</div>;
};

export default Display;
