import { Command } from "../types";

export const DM: Command = {
  command: 'route',
  title: 'DM',
  description: 'send a message to ship',
  arguments: ['ship', 'message'],
  routingTarget: ".CodeMirror",
}
