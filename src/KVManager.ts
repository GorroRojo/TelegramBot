export {};
declare const NAMESPACE: KVIX;
// type prefixStruct = {
//   prefix: string;
//   sub?: Record<string, prefixStruct>;
// };
// type prefixNames = 'TelegramUser' | 'Relation' | 'Dynamic' | 'Event' | 'Task'
// const PREFIXES: Record<prefixNames, prefixStruct> = {
//   TelegramUser: { prefix: "tus" },
//   Relation: { prefix: "rel" },
//   Dynamic: {
//     prefix: "dyn",
//     sub: {
//       Event: { prefix: "eve" },
//       Task: {
//         prefix: "tsk",
//         sub: {
//           Action: { prefix: "act" }
//         }
//       },
//       SessionPreset: { prefix: "spr" },
//       Session: { prefix: "ses" },
//     },
//   },
// };

const PREFIXES = {
  TelegramUser: { prefix: "tus" },
  Relation: { prefix: "rel" },
  Dynamic: {
    prefix: "dyn",
    sub: {
      Event: { prefix: "eve" },
      Task: {
        prefix: "tsk",
        sub: {
          Action: { prefix: "act" },
        },
      },
      SessionPreset: { prefix: "spr" },
      Session: { prefix: "ses" },
    },
  },
};
// fetch by prefix, for each of those
interface KVIX {
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: { expirationTtl?: number; expiration?: number; metadata?: any }
  ): Promise<any>;
  get(key: string, options?: any): Promise<any>;
  delete(key: string): Promise<any>;
  list(options?: {
    prefix?: string;
    cursor?: string;
  }): Promise<KeyValueListChunk>;
}
interface KeyValue {
  name: string;
  expiration: number;
  metadata?: any;
}
interface KeyValueListChunk {
  keys: KeyValue[];
  list_complete: boolean;
  cursor: string;
}

/** Gets data from the KV Namespace by prefix
 *
 * @param prefix - optional: prefix to search for
 * @returns An array of KeyValues
 */
async function getByPrefix(prefix: string = ""): Promise<KeyValue[]> {
  let list: KeyValue[] = [];
  let list_complete = false;
  let cursor: string = "";

  while (!list_complete) {
    let chunk: KeyValueListChunk;

    if (cursor == "") {
      chunk = await NAMESPACE.list({ prefix: prefix });
    } else {
      chunk = await NAMESPACE.list({ prefix: prefix, cursor: cursor });
    }

    list = list.concat(chunk.keys);

    list_complete = chunk.list_complete;
    cursor = chunk.cursor;
  }
  return list;
}

async function getUsers(): Promise<any> {
  return await getByPrefix(PREFIXES.TelegramUser.prefix);
}

async function getRelations(): Promise<any> {
  return await getByPrefix(PREFIXES.Relation.prefix);
}
async function getDynamics(): Promise<any> {
  const dyn: KeyValue[] = await getByPrefix(PREFIXES.Dynamic.prefix);
  let dynamic: any;
  dyn.forEach(async (value: KeyValue, index: number, array: KeyValue[]) => {
    let property: keyof typeof PREFIXES.Dynamic.sub;
    for (property in PREFIXES.Dynamic.sub) {
      Object.defineProperty(
        dynamic,
        property,
        await getByPrefix(value.name + PREFIXES.Dynamic.sub[property])
      );
    }
  });
}
export async function getLastUpdate() {
  return await NAMESPACE.get("base:last_update")
}
export async function setLastUpdate(update_id: number) {
  await NAMESPACE.put("base:last_update", update_id)
  ;
}


