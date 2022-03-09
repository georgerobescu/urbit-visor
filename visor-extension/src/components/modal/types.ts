import React from 'react';

export interface Command {
  command?: String;
  icon?: React.ReactNode;
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
  icon?: React.ReactNode;
}

export type MenuItem = Command | ContextMenuItem;
