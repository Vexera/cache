import {BaseCache} from "./BaseCache";
import * as Implementations from "../../implementations";
import {Redis} from "ioredis";
import * as Discord from "discord.d.ts";
import {channel as channelConverter, member as memberConverter} from "../../CacheConverter";
import {Guild, Member} from "../../types";

export class MemberCache extends BaseCache implements Implementations.MemberCache {
	constructor(redis: Redis, key: string) {
		super(redis, key);
	}

	async bulkAdd(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, members: Discord.GuildMember[]) {
		for (const member of members) {
			await this.redis.hset(this.hashKey, member.user.id, JSON.stringify({...memberConverter(member, guildID), shardID}))
		}
	}

	set(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, member: Discord.GuildMember) {
		const data = { ...memberConverter(member, guildID), shardID };

		return this.redis.hset(this.hashKey, data._id, JSON.stringify(data));
	}

	async get(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>): Promise<Member | null> {
		const member = await this.redis.hget(this.hashKey,`${guildID}.${memberID}`);
		return member ? JSON.parse(member) : null;
	}

	delete(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>) {
		return this.redis.hdel(this.hashKey, `${guildID}.${memberID}`);
	}

	getMutualGuilds(userID: Discord.Snowflake<Discord.User>): Promise<Guild[]> {
		// @ts-ignore
		return []; // TODO:
		// return this.collection.find({ userID }).toArray();
	}

	async deleteByGuild(guildID: Discord.Snowflake<Discord.Guild>) {
		const matched = await this.redis.hscan(this.hashKey, 0, `MATCH`, `${guildID}.*`);
		for (const match in matched[1]) {
			await this.redis.hdel(this.hashKey, match);
		}
	}

	async has(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>) {
		return Boolean(this.redis.hexists(this.hashKey, `${guildID}.${memberID}`));
	}
}
