/* This is because MongoDB removes fields if the value is null */
export default function removeNull<T extends { [key: string]: any }>(obj: T): T {
  for (const [k, v] of Object.entries(obj)) {
    if ([undefined, null].includes(v)) {
      delete obj[k];
    }
  }

  return obj;
}

export function removeNullPartial<T extends { [key: string]: any }>(obj: Partial<T>): Partial<T> {
  return removeNull<Partial<T>>(obj);
}