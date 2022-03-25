import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { urbitVisor } from '@dcspark/uv-core';
import Urbit from '@urbit/http-api';
import { Messaging } from '../../messaging';
import { VisorSubscription } from '../../types';
import Inputbox from './Inputbox';
import Body from './Body';
import { Poke } from './commands/Poke';
import { Scry } from './commands/Scry';
import { Subscribe } from './commands/Subscribe';
import { Spider } from './commands/Spider';
import { Terminal } from './commands/Terminal';
import { DM } from './commands/DM';
import { Notifications } from './commands/Notifications';
import { MenuItem, Command } from './types';
import { Groups } from './commands/Groups';
import { History } from './commands/History';
import { Home } from './commands/Home';
import { Bitcoin } from './commands/Bitcoin';

const initialCommands: Command[] = [
  History,
  Home,
  Poke,
  Scry,
  Subscribe,
  Spider,
  Terminal,
  DM,
  Groups,
  Notifications,
  Bitcoin,
];

const Modal = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState(null);
  const [contextItems, setContextItems] = useState(null);
  const [baseFocus, setBaseFocus] = useState(null);
  const [dims, setDims] = useState(null);
  const [selectedToInput, setSelectedToInput] = useState(null);
  const [keyDown, setKeyDown] = useState(null);
  const [nextArg, setNextArg] = useState(null);
  const [previousArg, setPreviousArg] = useState(null);
  const [sendCommand, setSendCommand] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [airlockResponse, setAirlockResponse] = useState(null);
  const [clearSelected, setClearSelected] = useState(null);
  const [spaceAllowed, setSpaceAllowed] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [prefilledArgs, setPrefilledArgs] = useState(null);
  const [argPreview, setArgPreview] = useState(null);
  const [firstSelected, setFirstSelected] = useState(null);
  const [connectShip, setConnectShip] = useState(
    'Please connect to a ship to use the Visor Command Launcher'
  );
  const [landscapeFork, setLandscapeFork] = useState(null);

  const [commands, setCommands] = useState([
    History,
    Home,
    Poke,
    Scry,
    Subscribe,
    Spider,
    Terminal,
    DM,
    Groups,
    Notifications,
    Bitcoin,
  ] as MenuItem[]);

  useEffect(() => {
    setNextArg(null);
    setPreviousArg(null);
    setSendCommand(null);
    setBaseFocus(false);
    setFirstSelected(false);
  }, [nextArg, previousArg, sendCommand, baseFocus, firstSelected]);
  useEffect(() => {
    if (clearSelected) {
      setSelectedToInput(null);
      setSelected('');
      setBaseFocus(true);
      setContextItems(null);
      setClearSelected(null);
      setArgPreview(false);
      setFirstSelected(false);
      setCommands(initialCommands.map(({ prefilledArguments, ...attr }) => attr));
    }
  }, [clearSelected]);

  useEffect(() => {
    let subscription: any;
    let number = 0;

    if (isConnected) {
      if (!metadata) {
        subscription = urbitVisor.on('sse', ['metadata-update', 'associations'], setMetadata);

        const setData = () => {
          urbitVisor.subscribe({ app: 'metadata-store', path: '/all' }).then(res => {
            console.log(res);
            number = res.response;
          });
        };
        urbitVisor.require(['subscribe'], setData);

        const landscapeFork = () => {
          urbitVisor.scry({ app: 'hood', path: '/kiln/vats' }).then(res => {
            if (res.response['escape']) {
              setLandscapeFork('escape');
            } else setLandscapeFork('landscape');
          });
        };
        urbitVisor.require(['scry'], landscapeFork);
      }
    }
    return () => {
      if (metadata && subscription) {
        urbitVisor.off(subscription);
        window.removeEventListener('message', setMetadata);
        urbitVisor.unsubscribe(number).then(res => console.log(''));
      }
    };
  }, [isConnected]);

  const handleMessage = (e: any) => {
    if (e.data == 'focus') {
      console.log('focusing');
      if (selectedToInput) {
        rootRef.current.focus();
      } else setBaseFocus(true);
    } else if (e.data == 'closing') {
      setClearSelected(true);
    } else return;
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  useEffect(() => {
    if (argPreview) {
      console.log(selected, 'selected changed');

      setSelectedToInput(selected);
    }
  }, [selected]);

  useEffect(() => {
    const sub = urbitVisor.on('connected', [], () => {
      handleConnection();
    });
    handleConnection();
    return () => urbitVisor.off(sub);
  });

  const handleConnection = () => {
    if (isConnected) {
      console.log('connected');
    } else {
      urbitVisor.isConnected().then(connected => {
        if (connected.response) {
          console.log('setting connected');
          setIsConnected(true);
          setConnectShip(null);
        }
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isConnected) {
      if (event.key == 'Enter' && selectedToInput !== selected && !contextItems) {
        console.log('selecting to input');
        event.preventDefault();
        setSelectedToInput(selected);
        setAirlockResponse(null);
      } else if (event.key == 'Enter' && selected == selectedToInput) {
        event.preventDefault();
        setSendCommand(true);
        setSpaceAllowed(false);
      } else if (event.key == 'Enter' && contextItems) {
        event.preventDefault();
        setSendCommand(true);
      } else if (event.shiftKey && event.key == 'Tab' && selected == selectedToInput) {
        setPreviousArg(true);
      } else if (event.key == 'Tab' && selected == selectedToInput) {
        setNextArg(true);
      } else if (event.key == 'Escape') {
        console.log('sending close');
        event.preventDefault();
        window.top.postMessage('close', '*');
        setClearSelected(true);
      } else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
        console.log('arrow event');
        event.preventDefault();
        setKeyDown(event);
        return;
      } else {
        return;
      }
    }
  };
  return (
    <div
      ref={rootRef}
      className="modal-container"
      id={'modalContainer'}
      onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event)}
      tabIndex={-1}
    >
      <Inputbox
        baseFocus={baseFocus}
        selectedToInput={selectedToInput}
        selected={selected}
        clearSelected={(clear: Boolean) => setClearSelected(clear)}
        nextArg={nextArg}
        previousArg={previousArg}
        sendCommand={sendCommand}
        airlockResponse={(res: any) => setAirlockResponse(res)}
        contextItems={items => {
          setContextItems(items);
          setSelected(items[0]);
          setFirstSelected(true);
        }}
        metadata={metadata}
        commands={initialCommands}
        setCommands={command => {
          setCommands(command);
          setSelected(command[0]);
          setFirstSelected(true);
        }}
        filteredCommands={commands => {
          setCommands(commands);
          setSelected(commands[0]);
          setFirstSelected(true);
        }}
        changeSelected={selected => {
          setSelected(selected);
          setSelectedToInput(selected);
        }}
        prefilledArgs={args => setPrefilledArgs(args)}
        setArgPreview={(preview: Boolean) => setArgPreview(preview)}
        argPreview={argPreview}
        placeholder={connectShip}
        landscapeFork={landscapeFork}
      />
      <Body
        commands={commands}
        handleSelection={(i: MenuItem) => setSelected(i)}
        selected={selected}
        keyDown={keyDown}
        airlockResponse={airlockResponse}
        contextItems={contextItems}
        firstSelected={firstSelected}
      />
    </div>
  );
};

export default Modal;
