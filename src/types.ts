import * as Discord from 'discord.d.ts';
import Redis from "ioredis";
import * as Implementations from "./implementations";

export interface CacheOptions {
  redis: Redis.Redis;
  caches: {
    channels?: Implementations.ChannelCache;
    guilds?: Implementations.GuildCache;
    members?: Implementations.MemberCache;
    users?: Implementations.UserCache;
    voiceStates?: Implementations.VoiceStateCache;
  };
  send: (shardID: number, event: Discord.SendableEvent) => any;
}

export interface ReceiveExtras<T = any> {
  guildWasUnavailable?: boolean;
  queued?: boolean;
  old?: T;
}

export interface VoiceState {
  _id: Discord.GuildSnowflake & Discord.UserSnowflake;
  guildID: Discord.GuildSnowflake;
  channelID: Discord.ChannelSnowflake;
  userID: Discord.UserSnowflake;
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
}

export interface Member {
  _id: Discord.GuildSnowflake & Discord.UserSnowflake;
  guildID: Discord.GuildSnowflake;
  userID: Discord.UserSnowflake;
  nickname?: string;
  roles: string[];
  joinedAt: string;
}

export interface User {
  _id: Discord.UserSnowflake;
  username: string;
  discriminator: string;
  avatar?: string;
  bot: boolean;
  selfID?: Discord.UserSnowflake;
}

export interface Guild {
  _id: Discord.GuildSnowflake;
  name: string;
  icon: string;
  ownerID: Discord.UserSnowflake;
  region: string;
  unavailable: boolean;
  roles: Role[];
}

export interface Role {
  id: Discord.RoleSnowflake;
  guildID: Discord.GuildSnowflake;
  name: string;
  color?: number;
  position: number;
  permissions: number;
}

export type Channel = GuildTextChannel | GuildVoiceChannel | GuildStoreChannel | GuildNewsChannel | GuildCategory;

export interface BaseChannel {
  _id: Discord.ChannelSnowflake;
  guildID: Discord.GuildSnowflake;
  name: string;
  type: Discord.ChannelType;
  position: number;
}

export interface GuildTextChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_TEXT;
  nsfw: boolean;
  topic?: string;
  parentID: Discord.ChannelSnowflake;
  overwrites: Overwrite[];
}

export interface GuildVoiceChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_VOICE;
  parentID: Discord.ChannelSnowflake;
  bitrate: number;
  userLimit: number;
  overwrites: Overwrite[];
}

export interface GuildStoreChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_STORE;
  parentID: Discord.ChannelSnowflake;
}

export interface GuildNewsChannel extends BaseChannel {
  type: Discord.ChannelType.GUILD_NEWS;
  parentID: Discord.ChannelSnowflake;
  nsfw: boolean;
  topic?: string;
  overwrites: Overwrite[];
}

export interface GuildCategory extends BaseChannel {
  type: Discord.ChannelType.GUILD_CATEGORY;
  overwrites: Overwrite[];
}

export interface Overwrite {
  id: Discord.UserSnowflake | Discord.RoleSnowflake;
  type: Discord.PermissionOverwriteType;
  allow: number;
  deny: number;
}
