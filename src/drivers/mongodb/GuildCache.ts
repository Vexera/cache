import { BaseCache } from './BaseCache';
import { guild as guildConverter, role as roleConverter } from '../../CacheConverter';
import * as Implementations from '../../implementations';
import * as Discord from 'discord.d.ts';
import { Guild } from '../../types';

export default class GuildCache extends BaseCache implements Implementations.GuildCache {
  set(shardID: number, id: Discord.Snowflake<Discord.Guild>, guild: Discord.Guild | Discord.UnavailableGuild) {
    const data = {
      ...guildConverter(guild),
      _id: id,
      shardID,
    };

    return this.collection.updateOne({ _id: id }, { $set: data }, { upsert: true });
  }

  bulkAdd(shardID: number, guilds: Array<Discord.Guild | Discord.UnavailableGuild>) {
    const ops = guilds.map((g) => ({
      updateOne: {
        filter: { _id: g.id },
        update: {
          $set: { ...guildConverter(g), shardID }
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);
    else return Promise.resolve();
  }

  get(id: Discord.Snowflake<Discord.Guild>): Promise<Guild | null> {
    return this.collection.findOne({ _id: id });
  }

  async addRole(guildID: Discord.Snowflake<Discord.Guild>, role: Discord.Role) {
    const data = roleConverter(role, guildID);

    const guild = await this.get(guildID);

    if (!guild) {
      throw new Error('Guild not found');
    }

    guild.roles = guild.roles.filter((r) => r.id !== data.id);

    guild.roles.push(data);

    return this.collection.updateOne({ _id: guildID }, { $set: { roles: guild.roles } });
  }

  async removeRole(guildID: Discord.Snowflake<Discord.Guild>, roleID: Discord.Snowflake<Discord.Role>) {
    const guild = await this.get(guildID);

    if (!guild) {
      throw new Error('Guild not found');
    }

    guild.roles = guild.roles.filter((r) => r.id !== roleID);

    return this.collection.updateOne({ _id: guildID }, { $set: { roles: guild.roles } });
  }

  delete(guildID: Discord.Snowflake<Discord.Guild>) {
    return this.collection.deleteOne({ _id: guildID });
  }

  async has(guildID: Discord.Snowflake<Discord.Guild>) {
    return await this.collection.find({ _id: guildID }).count() > 0;
  }
}
