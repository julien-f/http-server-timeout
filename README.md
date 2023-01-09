> This repository illustrate that Node's `http.Server` appears to timeout connections after ~5 minutes.

Running the server:

```
$ ./server.mjs
listening on http://localhost:8888
```

Running the client (which sends infinite random data to the server):

```
$ ./client.mjs
```

Here's what the problem looks like on the server:

```
done (5m 28.6s)
Error: aborted
    at connResetException (node:internal/errors:718:14)
    at abortIncoming (node:_http_server:747:17)
    at socketOnClose (node:_http_server:741:3)
    at Socket.emit (node:events:525:35)
    at TCP.<anonymous> (node:net:320:12) {
  code: 'ECONNRESET'
}
```

You can also use another client to trigger the issue, just make sure it will upload data for more that 6 minutes, for instance with cURL:

```
$ curl --limit-rate 1M -T /dev/urandom http://localhost:8888
```
