#!/usr/bin/env bash
nohup npm start > /dev/null 2>&1 &
npm run cucumber
kill %1