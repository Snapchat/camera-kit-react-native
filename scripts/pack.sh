#!/bin/bash
# This script will prepare a npm package and package.json file
# and then copy them to "output/npm" folder as it is required by Machamp.

set -u

ROOT_DIR=$(git rev-parse --show-toplevel)
RELATIVE_PATH=${PWD#"$ROOT_DIR"/}
PACK_NAME='camera-kit-react-native'
PACK_FILENAME=$PACK_NAME.tgz

# Pack npm packages
mkdir -p $ROOT_DIR/output/npm

pushd $ROOT_DIR

yarn pack --filename $PACK_FILENAME
mv $PACK_FILENAME output/npm
cp package.json output/npm/$PACK_NAME.json

popd
