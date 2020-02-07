import { Collection } from 'mongodb';

export class BaseCache {
  public collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  wipeByShardID(shardID: number) {
    return this.collection.deleteMany({ shardID });
  }

  count() {
    return this.collection.estimatedDocumentCount();
  }
}