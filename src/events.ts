import * as Discord from "discord.d.ts";

export interface Identifying {
  t: 'IDENTIFYING';
}

export type AllEvents = Discord.Dispatch.AllDispatchEvents | Identifying;

export type Extras = { shard_id: number };

export type Event = AllEvents & Extras;