import React from 'react';

export interface Command {
  command?: String;
  icon?: React.FunctionComponent;
  title: String;
  description: String;
  arguments?: string[];
  schema?: ((props: any[]) => {})[];
  routingTarget?: string;
  routingFill?: string;
}

export interface ContextMenuItem {
  commandTitle: string;
  title: string;
  description: string;
}

export type MenuItem = Command | ContextMenuItem;
