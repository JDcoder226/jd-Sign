#!/bin/bash
# Increase file descriptor limit and run Expo
ulimit -n 4096
cd "/Users/apple/Desktop/INP24-25/ING2/s8/React Native/jd-sign"
npm start -- --clear
