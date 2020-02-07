import { Redis } from 'ioredis';
import * as Discord from 'discord.d.ts';
import { Event } from './events';

export default class RedisHandler {
  constructor(private redis: Redis) {}

  /* Shard Loading */

  enableLoadingState(shardID: number) {
    return this.redis.set(`shard:${shardID}:loading`, '1');
  }

  disableLoadingState(shardID: number) {
    return this.redis.del(`shard:${shardID}:loading`);
  }

  async isLoading(shardID: number) {
    return !!await this.redis.exists(`shard:${shardID}:loading`);
  }

  /* Guild Timeouts */

  renewGuildTimeout(shardID: number, timeout = 60000) {
    return this.redis.set(`shard:${shardID}:guildTimeout`, '1', 'PX', timeout);
  }

  async isGuildTimeout(shardID: number) {
    return !!await this.redis.exists(`shard:${shardID}:guildTimeout`);
  }

  /* Ready Queue */

  async appendReadyQueue(shardID: number, event: Event) {
    await this.redis.rpush(`shard:${shardID}:queue`, JSON.stringify(event));
    await this.redis.expire(`shard:${shardID}:queue`, 300);
  }

  async popReadyQueue(shardID: number): Promise<Event | null> {
    const event = await this.redis.lpop(`shard:${shardID}:queue`);

    if(event) return JSON.parse(event);
    else return null;
  }

  /* Guild Queue */

  async appendGuildQueue(guildID: Discord.Snowflake<Discord.Guild>, event: Event) {
    await this.redis.rpush(`guild:${guildID}:queue`, JSON.stringify(event));
    await this.redis.expire(`guild:${guildID}:queue`, 30);
  }

  async popGuildQueue(guildID: Discord.Snowflake<Discord.Guild>): Promise<Event | null> {
    const event = await this.redis.lpop(`guild:${guildID}:queue`);

    if(event) return JSON.parse(event);
    else return null;
  }

  /* Guild Deleted */

  setGuildDeleted(guildID: Discord.Snowflake<Discord.Guild>) {
    return this.redis.set(`guild:${guildID}:deleted`, '1', 'EX', 5);
  }

  async isGuildDeleted(guildID: Discord.Snowflake<Discord.Guild>) {
    return !!await this.redis.exists(`guild:${guildID}:deleted`);
  }
}
