import * as Implementations from '../../implementations';
import * as Discord from "discord.d.ts";
import {BaseCache} from "./BaseCache";
import {channel as channelConverter} from "../../CacheConverter";

export class ChannelCache extends BaseCache implements Implementations.ChannelCache {
	async bulkAdd(shardID: number, channels: Discord.AnyGuildChannel[]) {
		for (const channel of channels) {
			await this.redis.hset(this.hashKey, channel.id, JSON.stringify({...channelConverter(channel), shardID}))
		}
	}

	set(shardID: number, channel: Discord.AnyGuildChannel) {
		const data = { ...channelConverter(channel), shardID };

		return this.redis.hset(this.hashKey, data._id || '', JSON.stringify(data)); // TODO: Fix undefined channel ID.
	}

	delete(channelID: Discord.Snowflake<Discord.Channel>) {
		return this.redis.hdel(this.hashKey, channelID);
	}

	async get(channelID: Discord.Snowflake<Discord.Channel>) {
		const channel = await this.redis.hget(this.hashKey, channelID);
		return channel ? JSON.parse(channel) : null;
	}

	async has(channelID: Discord.Snowflake<Discord.Channel>) {
		return Boolean(this.redis.hexists(this.hashKey, channelID));
	}
}
