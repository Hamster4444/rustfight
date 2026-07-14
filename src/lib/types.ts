export type Rarity =
  | "Consumer"
  | "Industrial"
  | "Restricted"
  | "Classified"
  | "Covert";

export interface Skin {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  price: number; // USD-equivalent coin value
}

export interface InventoryItem {
  uid: string; // unique instance id
  skin: Skin;
  acquiredAt: number;
}

export type GameName =
  | "Cases"
  | "Battles"
  | "Coinflip"
  | "Upgrader"
  | "Mines"
  | "Jackpot"
  | "Marketplace";

export interface GameRecord {
  id: string;
  game: GameName;
  wager: number;
  profit: number; // positive = win, negative = loss
  detail: string;
  timestamp: number;
}
