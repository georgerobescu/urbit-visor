import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging } from './messaging';

function shouldInject(): boolean {
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement ? documentElement.toLowerCase() === 'html' : true;
  const { doctype } = window.document;
  const docTypeCheck = doctype ? doctype.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}

function proofOfVisor() {
  (window as any).urbitVisor = true;
}

function embed(fn: Function) {
  const script = document.createElement('script');
  script.text = `(${fn.toString()})();`;
  document.documentElement.appendChild(script);
}

function appendLauncher() {
  const shadowWrapper = document.createElement('div');
  const shadowDOM = shadowWrapper.attachShadow({ mode: 'open' });
  const modal = document.createElement('dialog');
  modal.id = 'command-launcher-container';
  modal.style.padding = '0';
  modal.style.borderWidth = '2px';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '6px';
  const frame = document.createElement('iframe');
  frame.src = 'chrome-extension://oadimaacghcacmfipakhadejgalcaepg/launcher.html';
  frame.id = 'frame';
  frame.style.height = '560px';
  frame.style.width = '760px';
  frame.style.borderWidth = '0px';
  modal.appendChild(frame);
  shadowDOM.appendChild(modal);
  document.documentElement.appendChild(shadowWrapper);
  const handleHotkeys = (e: any) => {
    if (e.data == 'close') {
      console.log('closing');
      const modal: any = <any>(
        document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
      );
      modal.close();
    }
    //its an sse data
    else {
      const modal: any = <any>(
        document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
      );
      modal.firstElementChild.contentWindow.postMessage(e.data, '*');
    }
  };
  window.addEventListener('message', handleHotkeys);
  window.addEventListener('click', e => {
    const modal: any = <any>(
      document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
    );
    if (modal.open) {
      console.log('closing modal on click');
      modal.close();
      modal.firstElementChild.contentWindow.postMessage('closing', '*');
    } else {
      console.log('modal not open');
    }
  });
}
appendLauncher();

if (shouldInject()) {
  embed(proofOfVisor);
  Messaging.createProxyController();
}
