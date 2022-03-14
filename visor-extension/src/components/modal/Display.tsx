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
        <ReactJson
          style={{ padding: '15px' }}
          src={props.airlockResponse}
          enableClipboard={false}
        />
      );
    }
    // Otherwise
    else {
      displayContent = (
        <div style={{ textAlign: 'center' }}>{JSON.stringify(props.airlockResponse)}</div>
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
      {displayContent ? displayContent : 'hello'}
    </div>
  );
};

// Display the airlock subscription response UI
const AirlockSubscriptionResponse = (props: DisplayProps) => {
  return (
    <div className="airlock-subscription-display">
      {props.airlockResponse.map((line: any, index: number) => (
        <div key={index} className="airlock-subscription-display-line">
          {JSON.stringify(line)}
        </div>
      ))}
    </div>
  );
};

const SelectionPreview = (props: DisplayProps) => {
  const selectedCommand = () => props.selected as Command;
  const selectedContext = () => props.selected as ContextMenuItem;

  const defaultPreviewContent = (
    <div className="command-launcher-display-preview-container">
      <div className="command-preview-icon">
        <svg
          width="24"
          height="8.667"
          viewBox="0 0 36 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M36 0.167285C35.4595 7.94436 31.8595 12.0719 25.3802 12.1163C18.3297 12.1163 15.9603 6.9031 11.5479 6.9031C11.0313 6.88608 10.517 6.97921 10.0388 7.17635C9.56071 7.37348 9.1296 7.67015 8.77394 8.04678C7.93768 8.92759 7.41416 10.2932 7.10821 12.0548H0C0.258357 8.2448 1.1592 5.30876 2.78413 3.28768C3.24191 2.72173 3.77099 2.21793 4.35807 1.78893C5.983 0.604276 8.09745 0 10.7082 0C15.1649 0 17.7892 2.19178 20.2912 3.7315C21.651 4.57134 22.9802 5.21317 24.5405 5.21317C26.3184 5.21317 27.5354 4.11728 28.2799 2.34883C28.5648 1.64061 28.7722 0.90342 28.8986 0.150217L36 0.167285Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="command-title">Welcome to Urbit Visor Command Launcher</div>
      <div className="command-description">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing</p>
        <p>
          Press <span className="tab-symbol">TAB</span> to focus on each input variable as a
          separate block to move forward
        </p>
      </div>
    </div>
  );

  let selectionPreviewContent;
  const Icon = selectedCommand()?.icon;

  if (selectedCommand()) {
    selectionPreviewContent = (
      <div className="command-launcher-display-preview-container">
        <div className="command-preview-icon">{props.selected.icon}</div>
        <div className="command-title">{props.selected.title}</div>
        <div className="command-description">
          <p>{props.selected.description}</p>
          <p>
            Press <span className="tab-symbol">TAB</span> to focus on each input variable as a
            separate block to move forward
          </p>
        </div>
      </div>
    );
  } else if (selectedContext()) {
    selectionPreviewContent = (
      <div className="command-launcher-display-preview-container">context selected</div>
    );
  }
  return (
    <div className="command-launcher-display-preview">
      {selectionPreviewContent ? selectionPreviewContent : defaultPreviewContent}
    </div>
  );
};

export default Display;
