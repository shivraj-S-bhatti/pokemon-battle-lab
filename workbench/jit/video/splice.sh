#!/bin/sh
# Insert live FalkorDB Browser b-roll into the rendered animation, after the graph build and before the payoff card.
# Usage (repo root): sh workbench/jit/video/splice.sh path/to/broll.mov   -> .artifacts/video/gimmikghoul_final.mp4
set -e
BROLL="$1"; DIR=.artifacts/video; OUTF="${2:-$DIR/gimmikghoul_final.mp4}"
T=$(python3 -c "import json;print([s['start'] for s in json.load(open('$DIR/scenes.json')) if s['scene']=='payoff'][0])")
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$BROLL")
say -v Samantha -r 185 -o "$DIR/broll.aiff" "Here it is live in the FalkorDB Browser. The team and its core, with sprites. The traversal from Alcremie through Decorate to Mega Garchomp Z. And the damage results stored on the graph edges, before and after the boost."
ffmpeg -loglevel error -y -i "$DIR/broll.aiff" -ar 44100 -ac 1 -af "apad=whole_dur=$D" "$DIR/broll.wav"
ffmpeg -loglevel error -y -i "$DIR/gimmikghoul.mp4" -i "$BROLL" -i "$DIR/broll.wav" -filter_complex "
[0:v]trim=0:$T,setpts=PTS-STARTPTS[v1];[0:a]atrim=0:$T,asetpts=PTS-STARTPTS[a1];
[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x12141e,fps=30,format=yuv420p,
drawbox=x=0:y=0:w=iw:h=90:color=0x0a0b12@0.9:t=fill,
drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial Bold.ttf:text='GIMMIKGHOUL':fontcolor=0xffd640:fontsize=40:x=40:y=25,
drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial Bold.ttf:text='Live in FalkorDB Browser':fontcolor=white:fontsize=34:x=w-tw-40:y=28,setpts=PTS-STARTPTS[v2];
[2:a]asetpts=PTS-STARTPTS[a2];
[0:v]trim=start=$T,setpts=PTS-STARTPTS[v3];[0:a]atrim=start=$T,asetpts=PTS-STARTPTS[a3];
[v1][a1][v2][a2][v3][a3]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 160k "$OUTF"
echo "$OUTF (b-roll ${D}s inserted at ${T}s)"
