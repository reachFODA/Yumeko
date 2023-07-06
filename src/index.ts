import { ExtendedClient } from "./structs/ExtendedClient";
export * from "colors";

const client = new ExtendedClient();

client.start();

export { client }