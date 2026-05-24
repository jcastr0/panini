export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StickerType = "normal" | "shiny" | "legend" | "special";

export type TradeStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type TradeDirection = "offer" | "request";

type AlbumRow = {
  id: string;
  code: string;
  name: string;
  edition_year: number;
  total_stickers: number;
  cover_url: string | null;
  is_active: boolean;
  created_at: string;
};
type StickerRow = {
  id: string;
  album_id: string;
  number: number;
  name: string;
  team: string | null;
  group_code: string | null;
  type: StickerType;
  rarity: number;
  image_url: string | null;
};
type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  is_public_profile: boolean;
  created_at: string;
};
type UserStickerRow = {
  user_id: string;
  sticker_id: string;
  quantity: number;
  updated_at: string;
};
type TradeRow = {
  id: string;
  from_user: string;
  to_user: string;
  status: TradeStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
};
type TradeItemRow = {
  id: string;
  trade_id: string;
  sticker_id: string;
  direction: TradeDirection;
  quantity: number;
};

export interface Database {
  public: {
    Tables: {
      albums: {
        Row: AlbumRow;
        Insert: Partial<AlbumRow> & Pick<AlbumRow, "code" | "name" | "edition_year">;
        Update: Partial<AlbumRow>;
        Relationships: [];
      };
      stickers: {
        Row: StickerRow;
        Insert: Partial<StickerRow> &
          Pick<StickerRow, "album_id" | "number" | "name">;
        Update: Partial<StickerRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "username">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      user_stickers: {
        Row: UserStickerRow;
        Insert: Partial<UserStickerRow> &
          Pick<UserStickerRow, "user_id" | "sticker_id" | "quantity">;
        Update: Partial<UserStickerRow>;
        Relationships: [];
      };
      trades: {
        Row: TradeRow;
        Insert: Partial<TradeRow> & Pick<TradeRow, "from_user" | "to_user">;
        Update: Partial<TradeRow>;
        Relationships: [];
      };
      trade_items: {
        Row: TradeItemRow;
        Insert: Partial<TradeItemRow> &
          Pick<TradeItemRow, "trade_id" | "sticker_id" | "direction" | "quantity">;
        Update: Partial<TradeItemRow>;
        Relationships: [
          {
            foreignKeyName: "trade_items_trade_id_fkey";
            columns: ["trade_id"];
            isOneToOne: false;
            referencedRelation: "trades";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trade_items_sticker_id_fkey";
            columns: ["sticker_id"];
            isOneToOne: false;
            referencedRelation: "stickers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      find_trade_matches: {
        Args: { p_user_id: string };
        Returns: {
          other_user: string;
          username: string;
          display_name: string | null;
          city: string | null;
          they_offer_count: number;
          i_offer_count: number;
          score: number;
        }[];
      };
    };
    Enums: {
      sticker_type: StickerType;
      trade_status: TradeStatus;
      trade_direction: TradeDirection;
    };
    CompositeTypes: Record<string, never>;
  };
}
