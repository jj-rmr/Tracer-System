import { Account, Databases, Storage } from "node-appwrite";

import { createSessionClient } from "./session";

export function createServices(session: string) {
  const client = createSessionClient(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}
