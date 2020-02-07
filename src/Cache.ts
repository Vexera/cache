import * as Discord from "discord.d.ts";
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import RedisHandler from './RedisHandler';
import sleep from './utils/sleep';
import { Extras, Event } from "./events";
import { Member, VoiceState } from "./types";
import * as Implementations from "./implementations";

interface CacheOptions {
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

interface ReceiveExtras<T = any> {
  guildWasUnavailable?: boolean;
  queued?: boolean;
  old?: T;
}

export default class Cache extends EventEmitter {
  public send: (shardID: number, event: Discord.SendableEvent) => any;

  public redis: RedisHandler;
  public channels?: Implementations.ChannelCache;
  public guilds?: Implementations.GuildCache;
  public members?: Implementations.MemberCache;
  public users?: Implementations.UserCache;
  public voiceStates?: Implementations.VoiceStateCache;

  constructor(options: CacheOptions) {
    super();

    this.redis = new RedisHandler(options.redis);
    this.channels = options.caches.channels;
    this.guilds = options.caches.guilds;
    this.members = options.caches.members;
    this.users = options.caches.users;
    this.voiceStates = options.caches.voiceStates;
    this.send = options.send;
  }

  debug(...args: any[]) {
    this.emit('debug', ...args);
  }

  async receive(event: Event): Promise<ReceiveExtras>
  async receive(event: Discord.Dispatch.VoiceStateUpdate & Extras): Promise<ReceiveExtras<VoiceState>>;
  async receive(event: Discord.Dispatch.GuildMemberRemove & Extras): Promise<ReceiveExtras<Member>>;
  async receive(event: Event): Promise<ReceiveExtras> {
    if ('d' in event && 'guild_id' in event.d && event.d.guild_id !== undefined) {
      if (await this.redis.isGuildDeleted(event.d.guild_id)) {
        return { queued: true };
      }
    }

    // Extra information that will be returned
    const extras: ReceiveExtras  = {};

    switch (event.t) {
      case "IDENTIFYING": {
        this.debug(`Starting to load shard ${event.shard_id}`);
        await this.redis.enableLoadingState(event.shard_id);
        break;
      }
      case Discord.DispatchEventType.READY: {
        this.debug(`Invalidating old cache for shard ${event.shard_id}`);

        await Promise.all([
          this.channels?.wipeByShardID(event.shard_id),
          this.guilds?.wipeByShardID(event.shard_id),
          this.members?.wipeByShardID(event.shard_id),
          this.voiceStates?.wipeByShardID(event.shard_id)
        ]);

        if (this.guilds && event.d.guilds?.length > 0) {
          await this.redis.renewGuildTimeout(event.shard_id);
          await this.guilds.bulkAdd(event.shard_id, event.d.guilds);
        }

        await this.users?.set('self', event.d.user);
        await this.users?.set(event.d.user.id, event.d.user);

        await this.redis.disableLoadingState(event.shard_id);
        await this.processReadyQueue(event.shard_id);

        this.debug(`Shard ${event.shard_id} ready`);

        break;
      }
      case Discord.DispatchEventType.GUILD_CREATE:
      case Discord.DispatchEventType.GUILD_UPDATE: {
        if (await this.redis.isLoading(event.shard_id)) {
          await this.redis.appendReadyQueue(event.shard_id, event);
          extras.queued = true;
          break;
        }

        if (event.t === Discord.DispatchEventType.GUILD_CREATE) {
          if (this.guilds) {
            const guild = await this.guilds.get(event.d.id);

            if (guild?.unavailable && !event.d.unavailable) {
              extras.guildWasUnavailable = true;
            }
          }

          if (event.d.members) {
            await this.members?.bulkAdd(event.shard_id, event.d.id, event.d.members);
            await this.users?.bulkAdd(event.d.members.map((m) => m.user));

            if ((this.members || this.users) && (event.d.member_count - event.d.members.length) > 0) {
              this.debug(`Missing ${event.d.member_count - event.d.members.length} members, requesting...`, { guildID: event.d.id });

              this.requestGuildMembers(event.shard_id, event.d.id);
            }
          }

          if (this.voiceStates && event.d.voice_states) {
            await this.voiceStates.bulkAdd(event.shard_id, event.d.id, event.d.voice_states);
          }

          if (this.channels && event.d.channels) {
            await this.channels.bulkAdd(event.shard_id, event.d.channels);
          }
        }

        await this.guilds?.set(event.shard_id, event.d.id, event.d);

        this.debug(`Cached guild ${event.d.id}`, { guildID: event.d.id });

        await sleep(1000);
        await this.processGuildQueue(event.d.id);

        break;
      }
      case Discord.DispatchEventType.GUILD_DELETE: {
        if (await this.redis.isLoading(event.shard_id)) {
          await this.redis.appendReadyQueue(event.shard_id, event);
          extras.queued = true;
          break;
        }

        this.debug(`Guild ${event.d.id} ${event.d.unavailable ? 'is unavailable' : 'was removed'}`, { guildID: event.d.id });

        if (event.d.unavailable) {
          await this.guilds?.set(event.shard_id, event.d.id, event.d);
        } else {
          await sleep(200);

          await this.redis.setGuildDeleted(event.d.id);
          await this.guilds?.delete(event.d.id);
          await this.purgeUsers(event.d.id);
          await this.members?.deleteByGuild(event.d.id);
          await this.voiceStates?.deleteByGuild(event.d.id);
        }

        break;
      }
      case Discord.DispatchEventType.CHANNEL_CREATE:
      case Discord.DispatchEventType.CHANNEL_UPDATE: {
        if (event.d.type === Discord.ChannelType.DM) break;

        if (await this.isGuildUnavailable(event.d.guild_id)) {
          await this.redis.appendGuildQueue(event.d.guild_id, event);
          extras.queued = true;
          break;
        }

        await this.channels?.set(event.shard_id, event.d);

        this.debug(`New/Updated channel ${event.d.id}`, { channelID: event.d.id });
        break;
      }
      case Discord.DispatchEventType.CHANNEL_DELETE: {
        if (event.d.type === Discord.ChannelType.DM) break;

        if (await this.isGuildUnavailable(event.d.guild_id)) {
          await this.redis.appendGuildQueue(event.d.guild_id, event);
          extras.queued = true;
          break;
        }

        await this.channels?.delete(event.d.id);
        this.debug(`Deleted channel ${event.d.id}`, { channelID: event.d.id });

        break;
      }
      case Discord.DispatchEventType.GUILD_MEMBER_ADD:
      case Discord.DispatchEventType.GUILD_MEMBER_UPDATE: {
        await this.members?.set(event.shard_id, event.d.guild_id, event.d);
        await this.users?.set(event.d.user.id, event.d.user);

        this.debug(`New/Updated member ${event.d.user.id}`, { userID: event.d.user.id, guildID: event.d.guild_id });

        break;
      }
      case Discord.DispatchEventType.GUILD_MEMBER_REMOVE: {
        if (!this.members) break;

        extras.old = await this.members.get(event.d.guild_id, event.d.user.id);

        await this.members.delete(event.d.guild_id, event.d.user.id);

        if (this.users) {
          const mutuals = await this.members.getMutualGuilds(event.d.user.id);
          if (mutuals.length === 0) {
            await this.users.delete(event.d.user.id);
  
            this.debug(`Deleted user ${event.d.user.id} as there are no mutual servers`, { userID: event.d.user.id });
          }
        }

        this.debug(`Deleted member ${event.d.user.id}`, { userID: event.d.user.id, guildID: event.d.guild_id });

        break;
      }
      case Discord.DispatchEventType.GUILD_MEMBERS_CHUNK: {
        await this.members?.bulkAdd(event.shard_id, event.d.guild_id, event.d.members);
        await this.users?.bulkAdd(event.d.members.map(m => m.user));

        this.debug(`Cached ${event.d.members.length} members from chunk`, { guildID: event.d.guild_id });

        break;
      }
      case Discord.DispatchEventType.USER_UPDATE: {
        await this.users?.set(event.d.id, event.d);

        this.debug(`Updated user ${event.d.id}`, { userID: event.d.id });

        break;
      }
      case Discord.DispatchEventType.GUILD_ROLE_CREATE:
      case Discord.DispatchEventType.GUILD_ROLE_UPDATE: {
        if (await this.isGuildUnavailable(event.d.guild_id)) {
          await this.redis.appendGuildQueue(event.d.guild_id, event);
          extras.queued = true;
          break;
        }

        await this.guilds?.addRole(event.d.guild_id, event.d.role);

        this.debug(`Role created/updated`, { guildID: event.d.guild_id, roleID: event.d.role.id });

        break;
      }
      case Discord.DispatchEventType.GUILD_ROLE_DELETE: {
        if (await this.isGuildUnavailable(event.d.guild_id)) {
          await this.redis.appendGuildQueue(event.d.guild_id, event);
          extras.queued = true;
          break;
        }

        await this.guilds?.removeRole(event.d.guild_id, event.d.role_id);

        this.debug(`Role removed`, { guildID: event.d.guild_id, roleID: event.d.role_id });

        break;
      }
      case Discord.DispatchEventType.MESSAGE_CREATE: {
        if ('webhook_id' in event.d) break;
        
        await this.users?.set(event.d.author.id, event.d.author);

        if ('guild_id' in event.d && event.d.member) {
          await this.members?.set(event.shard_id, event.d.guild_id, event.d.member);
        }

        break;
      }
      case Discord.DispatchEventType.VOICE_STATE_UPDATE: {
        extras.old = await this.voiceStates?.get(event.d.guild_id, event.d.user_id);

        if (!event.d.channel_id) {
          await this.voiceStates?.delete(event.d.guild_id, event.d.user_id);
        } else {
          await this.voiceStates?.set(event.shard_id, event.d.guild_id, event.d.user_id, event.d);
        }

        break;
      }
      default: break;
    }

    return extras;
  }

  async processReadyQueue(shardID: number) {
    while (true) {
      const event = await this.redis.popReadyQueue(shardID);

      if (!event) break;

      await this.receive(event);
    }
  }

  async processGuildQueue(guildID: Discord.Snowflake<Discord.Guild>) {
    while (true) {
      const event = await this.redis.popGuildQueue(guildID);

      if (!event) break;

      await this.receive(event);
    }
  }

  requestGuildMembers(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, query = '', limit = 0) {
    this.send(shardID, {
      op: Discord.SendableOp.REQUEST_GUILD_MEMBERS,
      d: {
        guild_id: guildID,
        query,
        limit
      }
    });
  }

  async isGuildUnavailable(guildID: Discord.Snowflake<Discord.Guild>) {
    if (!this.guilds) return null;

    const guild = await this.guilds.get(guildID);

    return !guild || guild.unavailable;
  }

  async purgeUsers(guildID: Discord.Snowflake<Discord.Guild>) {
    if (!this.members || !this.users) return;

    const userIDs = await this.members.getPurgeableUsers(guildID);

    return this.users.bulkDelete(userIDs);
  }
}