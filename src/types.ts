import * as Discord from "discord.d.ts";

export interface VoiceState {
  _id: Discord.Snowflake<Discord.Guild & Discord.GuildMember>;
  guildID: Discord.Snowflake<Discord.Guild>;
  channelID: Discord.Snowflake<Discord.Channel>;
  userID: Discord.Snowflake<Discord.User>;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
}

export interface Member {
  _id: Discord.Snowflake<Discord.Guild & Discord.GuildMember>;
  guildID: Discord.Snowflake<Discord.Guild>;
  userID: Discord.Snowflake<Discord.User>;
  nickname?: string;
  roles: string[];
  joinedAt: string;
}

export interface User {
  _id: Discord.Snowflake<Discord.User>;
  username: string;
  discriminator: string;
  avatar?: string;
  bot: boolean;
  selfID?: Discord.Snowflake<Discord.User>;
}

export interface Guild {
  _id: Discord.Snowflake<Discord.Guild>;
  name: string;
  icon: string;
  ownerID: Discord.Snowflake<Discord.User>;
  region: string;
  unavailable: boolean;
  roles: Role[];
}

export interface Role {
  id: Discord.Snowflake<Discord.Role>;
  guildID: Discord.Snowflake<Discord.Guild>;
  name: string;
  color?: number;
  position: number;
  permissions: number;
}

export type Channel = GuildTextChannel | GuildVoiceChannel | GuildStoreChannel | GuildNewsChannel | GuildCategory;

export interface BaseChannel {
  _id: Discord.Snowflake<Discord.Channel>;
  guildID: Discord.Snowflake<Discord.Guild>;
  name: string;
  type: Discord.ChannelType;
  position: number;
}

export interface GuildTextChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_TEXT;
  nsfw: boolean;
  topic?: string;
  parentID: Discord.Snowflake<Discord.Channel>;
  overwrites: Overwrite[];
}

export interface GuildVoiceChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_VOICE;
  parentID: Discord.Snowflake<Discord.Channel>;
  bitrate: number;
  userLimit: number;
  overwrites: Overwrite[];
}

export interface GuildStoreChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_STORE;
  parentID: Discord.Snowflake<Discord.Channel>;
}

export interface GuildNewsChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_NEWS;
  parentID: Discord.Snowflake<Discord.Channel>;
  nsfw: boolean;
  topic?: string;
  overwrites: Overwrite[];
}

export interface GuildCategory extends BaseChannel {
  type: Discord.ChannelType.GUILD_CATEGORY;
  overwrites: Overwrite[];
}

export interface Overwrite {
  id: Discord.Snowflake<Discord.User | Discord.Role>;
  type: Discord.PermissionOverwriteType;
  allow: number;
  deny: number;
}