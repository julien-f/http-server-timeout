#!/usr/bin/env node

import { createServer } from "node:http";
import { pipeline } from "node:stream";
import fromEvent from "promise-toolbox/fromEvent";
import humanFormat from "human-format";
import ms from "pretty-ms";

async function main([port = 8888]) {
  const server = createServer((req, res) => {
    // req.on("socket", (s) => {
    //   s.setKeepAlive(true, 2 * 60 * 1e3);
    // });

    const start = Date.now();
    console.log(req.method, req.url);
    let length = 0;
    const report = () => {
      if (length !== 0) {
        console.log(ms(Date.now() - start), "-", humanFormat.bytes(length));
      }
      length = 0;
    };
    report.handle = setInterval(report, 10e3);
    pipeline(
      req,
      async function (input) {
        for await (const chunk of input) {
          length += chunk.length;
        }
      },
      (err) => {
        report();
        clearInterval(report.handle);
        console.log("done (%s)", ms(Date.now() - start));

        if (err != null) {
          console.warn(err);
          res.statusCode = 500;
          res.end("Internal Error");
        } else {
          res.end("Ok");
        }
      }
    );
  });
  // server.keepAliveTimeout = 200e3;
  // server.setTimeout(10e3);

  server.listen(port);
  await fromEvent(server, "listening");
  console.log("listening on http://localhost:%s", server.address().port);

  process.on("SIGINT", () => {
    server.close();
    server.closeIdleConnections();

    process.on("SIGINT", () => {
      console.log("Force quit");
      process.exit();
    });
  });
  await fromEvent(server, "close");
}
main(process.argv.slice(2)).catch(console.error);
