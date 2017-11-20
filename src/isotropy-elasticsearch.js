import ElasticSearch from "./elasticsearch";

const servers = {};

export function init(name, data) {
  const elasticsearch = new ElasticSearch(data);
  servers[name] = elasticsearch;
}

export async function open(name) {
  return servers[name].open();
}

export function __data(name) {
  return servers[name].data;
}
