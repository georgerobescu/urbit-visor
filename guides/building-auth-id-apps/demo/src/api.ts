import {urbitVisor} from "@dcspark/uv-core";

type Ship = string;
export async function visorAuth(backendShip: Ship, callback: Function) {
   await urbitVisor.poke({app: "dm-hook", mark: "dm-hook-action", json: {
     accept: "~" + backendShip
  }});
  let on: any = null;
  on = urbitVisor.on("sse", ["graph-update", "add-nodes"], (data: any) => {
    const node = data.nodes[Object.keys(data.nodes)[0]];
    const isDM = data.resource.name === "dm-inbox";
    const isMine = node.post.author === backendShip;
    if (isDM && isMine) {
      const token = node.post.contents[0].text.split("\n ")[1];
      callback(token);
      urbitVisor.unsubscribe(sub);
      urbitVisor.off(on);
    }
  });
  const sub = await urbitVisor.subscribe({
    app: "graph-store",
    path: "/updates",
  });
}