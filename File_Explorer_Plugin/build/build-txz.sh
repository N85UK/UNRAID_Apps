#!/bin/bash
set -e
VERSION="$1"
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

rm -rf staging_release
mkdir -p staging_release/file-explorer
cp -R build staging_release/file-explorer
cp -R webgui staging_release/file-explorer/
cp -R scripts staging_release/file-explorer/
cp -R proxy staging_release/file-explorer/

TAR=file-explorer-${VERSION}.txz

tar -cJf $TAR -C staging_release file-explorer
md5 -q $TAR
