import * as Discord from "discord.d.ts";
import { Guild, Member, VoiceState, Channel, User } from "./types";

export interface BaseCache {
  wipeByShardID(shardID: number): Promise<any>;
  count(): Promise<number>;
}

export interface UserCache extends BaseCache {
  bulkAdd(users: Discord.User[]): Promise<any>;
  bulkDelete(userIDs: Discord.Snowflake<Discord.User>[]): Promise<any>;
  set(id: Discord.Snowflake<Discord.User>, user: Discord.User): Promise<any>;
  delete(userID: Discord.Snowflake<Discord.User>): Promise<any>;
  get(userID: Discord.Snowflake<Discord.User>): Promise<User | null>;
  has(userID: Discord.Snowflake<Discord.User>): Promise<boolean>;
}

export interface GuildCache extends BaseCache {
  bulkAdd(shardID: number, guilds: Discord.Guild[] | Discord.UnavailableGuild[]): Promise<any>;
  get(id: Discord.Snowflake<Discord.Guild>): Promise<Guild | null>;
  set(shardID: number, id: Discord.Snowflake<Discord.Guild>, guild: Discord.Guild | Discord.UnavailableGuild): Promise<any>;
  addRole(guildID: Discord.Snowflake<Discord.Guild>, role: Discord.Role): Promise<any>;
  removeRole(guildID: Discord.Snowflake<Discord.Guild>, roleID: Discord.Snowflake<Discord.Role>): Promise<any>;
  delete(guildID: Discord.Snowflake<Discord.Guild>): Promise<any>;
  has(guildID: Discord.Snowflake<Discord.Guild>): Promise<boolean>;
}

export interface ChannelCache extends BaseCache {
  bulkAdd(shardID: number, channels: Discord.Channel[]): Promise<any>;
  set(shardID: number, channel: Discord.AnyGuildChannel): Promise<any>;
  delete(channelID: Discord.Snowflake<Discord.Channel>): Promise<any>;
  get(channelID: Discord.Snowflake<Discord.Channel>): Promise<Channel | null>;
  has(channelID: Discord.Snowflake<Discord.Channel>): Promise<boolean>;
}

export interface MemberCache extends BaseCache {
  bulkAdd(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, members: Discord.GuildMember[]): Promise<any>;
  set(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, member: Partial<Discord.GuildMember>): Promise<any>;
  get(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>): Promise<Member | null>;
  delete(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>): Promise<any>;
  deleteByGuild(guildID: Discord.Snowflake<Discord.Guild>): Promise<any>;
  getMutualGuilds(userID: Discord.Snowflake<Discord.User>): Promise<Guild[]>;
  getPurgeableUsers(guildID: Discord.Snowflake<Discord.Guild>): Promise<Discord.Snowflake<Discord.User>[]>;
  has(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>): Promise<boolean>;
}

export interface VoiceStateCache extends BaseCache {
  bulkAdd(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, voiceStates: Partial<Discord.VoiceState>[]): Promise<any>;
  set(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, userID: Discord.Snowflake<Discord.User>, voiceState: Discord.VoiceState): Promise<any>;
  get(guildID: Discord.Snowflake<Discord.Guild>, userID: Discord.Snowflake<Discord.User>): Promise<VoiceState | null>;
  delete(guildID: Discord.Snowflake<Discord.Guild>, userID: Discord.Snowflake<Discord.User>): Promise<any>;
  deleteByGuild(guildID: Discord.Snowflake<Discord.Guild>): Promise<any>;
  has(guildID: Discord.Snowflake<Discord.Guild>, userID: Discord.Snowflake<Discord.User>): Promise<boolean>;
}