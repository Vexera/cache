import { BaseCache } from './BaseCache';
import { member as memberConverter } from '../../CacheConverter';
import * as Implementations from '../../implementations';
import * as Discord from 'discord.d.ts';
import { Member, Guild } from '../../types';

export default class MemberCache extends BaseCache implements Implementations.MemberCache {
  bulkAdd(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, members: Discord.GuildMember[]) {
    const ops = members.map((m) => ({
      updateOne: {
        filter: { _id: `${guildID}.${m.user.id}` },
        update: {
          $set: { ...memberConverter(m, guildID), shardID }
        },
        upsert: true,
      }
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);
    else return Promise.resolve();
  }

  set(shardID: number, guildID: Discord.Snowflake<Discord.Guild>, member: Discord.GuildMember) {
    const data = { ...memberConverter(member, guildID), shardID };

    return this.collection.updateOne({ _id: data._id }, { $set: data }, { upsert: true });
  }

  get(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>): Promise<Member | null> {
    return this.collection.findOne({ _id: `${guildID}.${memberID}` });
  }

  delete(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>) {
    return this.collection.findOne({ _id: `${guildID}.${memberID}` });
  }

  getMutualGuilds(userID: Discord.Snowflake<Discord.User>): Promise<Guild[]> {
    return this.collection.find({ userID }).toArray();
  }

  getPurgeableUsers(guildID: Discord.Snowflake<Discord.Guild>) {
    return this.collection.aggregate([
      { $match: { guildID } }, // Filter by the deleted guild
      {
        $lookup: {
          from: this.collection.collectionName,
          as: 'otherMembers',
          let: { indicator_id: '$userID' }, // Variables for pipeline
          pipeline: [
            { $match: { $expr: { $eq: ['$userID', '$$indicator_id'] } } }, // Match to variable
            { $limit: 2 }, // Set lookup limit to 2
          ],
        },
      }, // Get other members stored with the same user ID
      { $project: { mutualServers: { $size: '$otherMembers' }, userID: 1 } }, // Get mutual servers count
      { $match: { mutualServers: { $lte: 1 } } }, // Filter by users with only one mutual server
      { $project: { userID: 1 } }, // Project user ID
    ]).toArray().then(r => r.map(x => x.userID));
  }

  deleteByGuild(guildID: Discord.Snowflake<Discord.Guild>) {
    return this.collection.deleteMany({ guildID });
  }

  async has(guildID: Discord.Snowflake<Discord.Guild>, memberID: Discord.Snowflake<Discord.User>) {
    return await this.collection.find({ _id: `${guildID}.${memberID}` }).count() > 0;
  }
}
