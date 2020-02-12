import * as Discord from 'discord.d.ts';
import { Guild, Member, VoiceState, Channel, User } from './types';

export interface BaseCache {
  wipeByShardID(shardID: number): Promise<any>;
  count(): Promise<number>;
}

export interface UserCache extends BaseCache {
  bulkAdd(users: Discord.User[]): Promise<any>;
  bulkDelete(userIDs: Discord.UserSnowflake[]): Promise<any>;
  set(id: Discord.UserSnowflake, user: Discord.User): Promise<any>;
  delete(userID: Discord.UserSnowflake): Promise<any>;
  get(userID: Discord.UserSnowflake): Promise<User | null>;
  has(userID: Discord.UserSnowflake): Promise<boolean>;
}

export interface GuildCache extends BaseCache {
  bulkAdd(shardID: number, guilds: Discord.Guild[] | Discord.UnavailableGuild[]): Promise<any>;
  get(id: Discord.GuildSnowflake): Promise<Guild | null>;
  set(shardID: number, id: Discord.GuildSnowflake, guild: Discord.Guild | Discord.UnavailableGuild): Promise<any>;
  addRole(guildID: Discord.GuildSnowflake, role: Discord.Role): Promise<any>;
  removeRole(guildID: Discord.GuildSnowflake, roleID: Discord.RoleSnowflake): Promise<any>;
  delete(guildID: Discord.GuildSnowflake): Promise<any>;
  has(guildID: Discord.GuildSnowflake): Promise<boolean>;
}

export interface ChannelCache extends BaseCache {
  bulkAdd(shardID: number, channels: Discord.Channel[]): Promise<any>;
  set(shardID: number, channel: Discord.AnyGuildChannel): Promise<any>;
  delete(channelID: Discord.ChannelSnowflake): Promise<any>;
  get(channelID: Discord.ChannelSnowflake): Promise<Channel | null>;
  has(channelID: Discord.ChannelSnowflake): Promise<boolean>;
}

export interface MemberCache extends BaseCache {
  bulkAdd(shardID: number, guildID: Discord.GuildSnowflake, members: Discord.GuildMember[]): Promise<any>;
  set(shardID: number, guildID: Discord.GuildSnowflake, member: Partial<Discord.GuildMember>): Promise<any>;
  get(guildID: Discord.GuildSnowflake, memberID: Discord.UserSnowflake): Promise<Member | null>;
  delete(guildID: Discord.GuildSnowflake, memberID: Discord.UserSnowflake): Promise<any>;
  deleteByGuild(guildID: Discord.GuildSnowflake): Promise<any>;
  getMutualGuilds(userID: Discord.UserSnowflake): Promise<Guild[]>;
  getPurgeableUsers(guildID: Discord.GuildSnowflake): Promise<Discord.UserSnowflake[]>;
  has(guildID: Discord.GuildSnowflake, memberID: Discord.UserSnowflake): Promise<boolean>;
}

export interface VoiceStateCache extends BaseCache {
  bulkAdd(shardID: number, guildID: Discord.GuildSnowflake, voiceStates: Partial<Discord.VoiceState>[]): Promise<any>;
  set(shardID: number, guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake, voiceState: Discord.VoiceState): Promise<any>;
  get(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake): Promise<VoiceState | null>;
  delete(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake): Promise<any>;
  deleteByGuild(guildID: Discord.GuildSnowflake): Promise<any>;
  has(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake): Promise<boolean>;
}
