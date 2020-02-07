import * as Implementations from '../../implementations';
import {Redis} from "ioredis";

export class BaseCache implements Implementations.BaseCache {
	constructor(public redis: Redis, public hashKey: string) {}

	wipeByShardID(shardID: number): Promise<any> {
		return Promise.resolve(1);
	}

	count(): Promise<number> {
		return Promise.resolve(1);
	}
}
