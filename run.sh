#!/bin/sh
exec /usr/bin/node --harmony /app/index.js --config /host/config.json >> /host/node.log 2>&1
