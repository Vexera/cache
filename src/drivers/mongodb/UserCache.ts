import { BaseCache } from './BaseCache';
import { user } from '../../CacheConverter';
import * as Implementations from '../../implementations';
import * as Discord from 'discord.d.ts';

export class UserCache extends BaseCache implements Implementations.UserCache {
  set(id: Discord.Snowflake<Discord.User>, data: Discord.User) {
    const converted = user(data);

    if (id === 'self') {
      converted.selfID = converted._id;
      converted._id = id;
    }

    return this.collection.updateOne(
      { _id: id },
      { $set: converted },
      { upsert: true }
    );
  }

  bulkAdd(users: Discord.User[]) {
    const ops = users.map((u) => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: user(u) },
        upsert: true
      }
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);
    else return Promise.resolve();
  }

  delete(userID: Discord.Snowflake<Discord.User>) {
    return this.collection.deleteOne({ _id: userID });
  }

  bulkDelete(userIDs: Discord.Snowflake<Discord.User>[]) {
    const ops = userIDs.map((_id) => ({
      deleteOne: {
        filter: { _id },
      }
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);
    else return Promise.resolve();
  }

  get(userID: Discord.Snowflake<Discord.User>) {
    return this.collection.findOne({ _id: userID });
  }

  async has(userID: Discord.Snowflake<Discord.User>) {
    return await this.collection.find({ _id: userID }).count() > 0;
  }
}
