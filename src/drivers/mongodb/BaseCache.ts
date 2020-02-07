import { Collection } from 'mongodb';

export class BaseCache {
  constructor(public collection: Collection) {}

  wipeByShardID(shardID: number) {
    return this.collection.deleteMany({ shardID });
  }

  count() {
    return this.collection.estimatedDocumentCount();
  }
}
