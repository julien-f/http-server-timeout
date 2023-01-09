#!/usr/bin/env node

import { pipeline } from "node:stream/promises";
import { request } from "node:http";
import fromEvent from "promise-toolbox/fromEvent";
import Throttle from "throttle";

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomBuf(buf) {
  const n = buf.length;
  for (let i = 0; i < n; ++i) {
    buf[i] = randomInt();
  }
  return buf;
}

function* randomStream() {
  const buf = Buffer.allocUnsafe(1024);
  while (true) {
    yield randomBuf(buf);
  }
}

async function main([bps]) {
  const req = request("http://localhost:8888", { method: "PUT" });
  req.setTimeout(10e3);

  const streams = [randomStream];
  if (bps !== undefined) {
    streams.push(new Throttle(+bps));
  }
  streams.push(req);

  const [res] = await Promise.all([
    fromEvent(req, "response"),
    pipeline(streams),
  ]);
  await pipeline(res, process.stdout);
}
main(process.argv.slice(2)).catch(console.error);
