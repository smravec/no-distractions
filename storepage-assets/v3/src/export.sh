#!/bin/zsh
# usage: export.sh <srcDir> <outDir>  — render @2x, downsample to exact CWS size, strip alpha
set -e
R=${0:A:h}; SRC=$1; OUT=$2; T=$R/tmp-$$
cd $R && node render.mjs $SRC $T >/dev/null
for f in $T/*@2x.png; do n=$(basename $f @2x.png)
  w=$(sips -g pixelWidth $f | awk '/pixelWidth/{print $2/2}'); h=$(sips -g pixelHeight $f | awk '/pixelHeight/{print $2/2}')
  sips -s format jpeg -s formatOptions 100 -z $h $w $f --out $T/$n.jpg >/dev/null
  sips -s format png $T/$n.jpg --out $OUT/$n.png >/dev/null; done
rm -rf $T; echo exported to $OUT
