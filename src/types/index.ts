// schema 對應 TypeScript 型別

export interface Sport {
  sport_key: string;
  sport_name: string;
  event_count: number;
}

export interface BookmakerOdds {
  bookmaker_key: string;
  bookmaker_title?: string;
  last_update?: string;
  h2h: {
    home?: number | null;
    away?: number | null;
  };
  spreads: {
    home?: { price?: number | null; point?: number | null };
    away?: { price?: number | null; point?: number | null };
  };
  totals: {
    over?: { price?: number | null; point?: number | null };
    under?: { price?: number | null; point?: number | null };
  };
}
export interface H2HOdds {
  home: number | null;
  away: number | null;
}

export interface SpreadOdds {
  home_price: number | null;
  home_point: number | null;
  away_price: number | null;
  away_point: number | null;
}

export interface TotalOdds {
  over_price: number | null;
  over_point: number | null;
  under_price: number | null;
  under_point: number | null;
}

export type OddsValue = H2HOdds | SpreadOdds | TotalOdds;
export interface Event {
  event_id: string;
  sport_key: string;
  home_team?: string;
  away_team?: string;
  commence_time: string;
  bookmakers: BookmakerOdds[];
  is_live: boolean;
}

export interface EventDetail {
  event_id: string;
  sport_key: string;
  home_team?: string;
  away_team?: string;
  commence_time: string;
  current_odds: BookmakerOdds[];
  odds_comparison: Record<string, OddsValue>;
}

export type MarketType = "h2h" | "spreads" | "totals";

export interface OddsHistoryPoint {
  timestamp: string;            // ISO
  bookmaker: string;
  market_type: MarketType;
  values: Record<string, number | null>;
}

export interface OddsHistory {
  event_id: string;
  home_team?: string;
  away_team?: string;
  market_type: MarketType;
  bookmaker?: string | null;
  history: OddsHistoryPoint[];
}
