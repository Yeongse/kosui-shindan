#!/usr/bin/env bash
# 調香箋 30秒動画 自動組み立てスクリプト v3
# 変更点:
#   - 冒頭0秒から強フックテロップ「香水、なにが合うか 悩みませんか？」を上部に大きく表示
#   - モンタージュ各カットの終わりに、そのタイプのポートレートが円形でフェードイン
#
# ■ 事前準備
#   ~/dev/kosui-shindan/sns/
#     videos/gen1.mp4 〜 gen6.mp4
#     images/m10-quiz-q01.png / m19-loading.png / m20-result-viewport.png / m01-top-hero.png
#     telops/t00.png 〜 t10.png, p1.png 〜 p3.png   ← telops-v2.zip を展開して配置（旧telopsは丸ごと置き換え）
#     bgm.mp3   ← 任意
#
# ■ 実行
#   cd ~/dev/kosui-shindan/sns && bash assemble.sh

set -euo pipefail

ROOT="$HOME/dev/kosui-shindan/sns"
V="$ROOT/videos"
IMG="$ROOT/images"
T="$ROOT/telops"
OUT="$ROOT/output"
TMP="$OUT/tmp"
mkdir -p "$TMP"

ENC=(-c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -an)
FIT="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1"

echo "▶ 1/4 各カットを切り出し中..."
ffmpeg -y -v error -ss 0.5 -t 4 -i "$V/gen1.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/01.mp4"
ffmpeg -y -v error -ss 0.5 -t 4 -i "$V/gen2.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/02.mp4"
ffmpeg -y -v error -ss 1.0 -t 3 -i "$V/gen3.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/03.mp4"
ffmpeg -y -v error -loop 1 -t 2 -i "$IMG/m10-quiz-q01.png" \
  -vf "scale=1080:-2,crop=1080:1920:0:0,fps=30,setsar=1" "${ENC[@]}" "$TMP/04.mp4"
ffmpeg -y -v error -ss 1.5 -t 2 -i "$V/gen4.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/05.mp4"
ffmpeg -y -v error -ss 1.5 -t 2 -i "$V/gen5.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/06.mp4"
ffmpeg -y -v error -ss 1.5 -t 2 -i "$V/gen6.mp4" -vf "$FIT" "${ENC[@]}" "$TMP/07.mp4"
ffmpeg -y -v error -loop 1 -t 2 -i "$IMG/m19-loading.png" \
  -vf "scale=1080:-2,crop=1080:1920:0:0,fps=30,setsar=1" "${ENC[@]}" "$TMP/08.mp4"
ffmpeg -y -v error -loop 1 -t 5 -i "$IMG/m20-result-viewport.png" \
  -vf "scale=1080:-2,crop=1080:1920:0:'if(lt(t,1.5),0,(t-1.5)/3.5*(ih-1920))',fps=30,setsar=1" \
  "${ENC[@]}" "$TMP/09.mp4"
ffmpeg -y -v error -loop 1 -t 4 -i "$IMG/m01-top-hero.png" \
  -vf "scale=1080:-2,crop=1080:1920:0:0,fps=30,setsar=1" "${ENC[@]}" "$TMP/10.mp4"

echo "▶ 2/4 連結中..."
: > "$TMP/list.txt"
for i in 01 02 03 04 05 06 07 08 09 10; do
  echo "file '$TMP/$i.mp4'" >> "$TMP/list.txt"
done
ffmpeg -y -v error -f concat -safe 0 -i "$TMP/list.txt" \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -an "$TMP/joined.mp4"

echo "▶ 3/4 テロップ・ポートレート合成中..."
ffmpeg -y -v error -i "$TMP/joined.mp4" \
  -i "$T/t00.png" -i "$T/t01.png" -i "$T/t02.png" -i "$T/t03.png" -i "$T/t04.png" \
  -i "$T/t05.png" -i "$T/t06.png" -i "$T/t07.png" -i "$T/t08.png" -i "$T/t09.png" \
  -i "$T/t10.png" \
  -loop 1 -i "$T/p1.png" -loop 1 -i "$T/p2.png" -loop 1 -i "$T/p3.png" \
  -filter_complex "\
[11:v]format=rgba,fade=t=in:st=13.8:d=0.4:alpha=1[p1];\
[12:v]format=rgba,fade=t=in:st=15.8:d=0.4:alpha=1[p2];\
[13:v]format=rgba,fade=t=in:st=17.8:d=0.4:alpha=1[p3];\
[0:v][1:v]overlay=0:0:enable='between(t,0,4)'[v1];\
[v1][2:v]overlay=0:0:enable='between(t,1.5,4)'[v2];\
[v2][3:v]overlay=0:0:enable='between(t,4.4,8)'[v3];\
[v3][4:v]overlay=0:0:enable='between(t,8.4,11)'[v4];\
[v4][5:v]overlay=0:0:enable='between(t,11.2,13)'[v5];\
[v5][6:v]overlay=0:0:enable='between(t,13.3,19)'[v6];\
[v6][7:v]overlay=0:0:enable='between(t,13.3,15)'[v7];\
[v7][8:v]overlay=0:0:enable='between(t,15,17)'[v8];\
[v8][9:v]overlay=0:0:enable='between(t,17,19)'[v9];\
[v9][p1]overlay=0:0:enable='between(t,13.8,15)'[v10];\
[v10][p2]overlay=0:0:enable='between(t,15.8,17)'[v11];\
[v11][p3]overlay=0:0:enable='between(t,17.8,19)'[v12];\
[v12][10:v]overlay=0:0:enable='between(t,26.3,30)'[v13];\
[v13][11:v]overlay=0:0:enable='between(t,27.5,30)'[v]" \
  -map "[v]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -an "$TMP/telop.mp4"

echo "▶ 4/4 音声を合成中..."
if [ -f "$ROOT/bgm.mp3" ]; then
  ffmpeg -y -v error -i "$TMP/telop.mp4" -i "$ROOT/bgm.mp3" \
    -filter_complex "[1:a]volume='if(between(t,19,21),0.25,0.7)':eval=frame,afade=t=out:st=28.5:d=1.5[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUT/chokosen-30s-draft.mp4"
else
  ffmpeg -y -v error -i "$TMP/telop.mp4" -f lavfi -i anullsrc=r=44100:cl=stereo \
    -map 0:v -map 1:a -c:v copy -c:a aac -shortest -t 30 \
    
    "$OUT/chokosen-30s-draft.mp4"
fi

rm -rf "$TMP"
echo "✅ 完成: $OUT/chokosen-30s-draft.mp4"