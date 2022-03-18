import moonIcon from "./icons/type-moon.svg";
import planetIcon from "./icons/type-planet.svg";
import starIcon from "./icons/type-star.svg";
import galaxyIcon from "./icons/type-galaxy.svg";
import cometIcon from "./icons/type-comet.svg";


export function processName(shipName: string): string{
    if(shipName.length > 30){
        return `${shipName.substring(0,6)}_${shipName.slice(-6)}`
    } else{
        return shipName
    }
}

export function whatShip(shipName: string) : string{
    if (shipName.length > 30) return "comet" 
    if (shipName.length > 14) return "moon" 
    if (shipName.length > 7) return "planet"
    if (shipName.length > 4) return "star"
    else return "galaxy"
}

export const permDescriptions = {
    shipName: "The name (@p) of your Urbit ship/identity.",
    shipURL: "The URL of your running Urbit ship.",
    scry: "Reads data from your Urbit ship.",
    poke: "Sends data to your Urbit ship.",
    thread: "Issues spider threads in your Urbit ship.",
    subscribe: "Reads a continuous stream of data from your Urbit ship.",
    auth: "Authenticates your Urbit ship to requesting websites"
}

export function getIcon(patp: string){
    switch (whatShip(patp)){
      case "comet": return cometIcon;
      case "planet": return planetIcon;
      case "star": return starIcon;
      case "galaxy": return galaxyIcon;
      case "moon": return moonIcon;
    }
  }