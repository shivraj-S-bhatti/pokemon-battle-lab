# Extract one trustworthy battle before indexing a channel

Research date: 2026-10-17. Decision: a small demo is feasible if it starts with one team explanation and one battle, with independently checked evidence. Full-channel extraction is not yet reliable in our implementation.

## What the failed calls establish

Our adapter sends a YouTube URL through OpenRouter, pins Google AI Studio, and requests text. It exposes neither native clipping nor FPS controls nor a JSON schema. The existing prompt asks for segmentation, sets, chronological board states, commentary, strategic claims and coverage in one response. That scope is a plausible reason for excessive generation, but is not a proven model-internal diagnosis.

The first detailed request and the later high-reasoning request both ended with `length`. The low-reasoning answer denied access. A narrowly worded opening extraction returned parseable JSON, but no independent frame verification has established its accuracy. Provider video-token accounting establishes billing/processing attribution, not semantic coverage or accuracy. Evidence: `.artifacts/video-gemini-response.json`, `.artifacts/video-gemini-low-response.json`, `.artifacts/video-short-response.json`, `.artifacts/video-full-high-response.json`.

## Google now has two different video modes

Google documents static input, normally sampled at 1 FPS, and newer agentic video navigation. Agentic mode loads selected transcript, frame or audio segments on demand. Its documented model list includes Gemini 4 Argon, 3.8 Flash, 3.6 Flash and 3.5 Flash Lite; **3.1 Pro is absent**. Therefore “there is no video-processing flag” was too broad. There is one for supported models, but it cannot be assumed available on our chosen model. Higher media resolution allocates more tokens to small visual details. Sampling can miss short transitions. [Google video guide](https://ai.google.dev/gemini-api/docs/video-understanding)

OpenRouter accepts `processing: "agentic"` on a `video_url` content part and documents preserving encrypted reasoning details on follow-up turns. Its YouTube URL route is Google AI Studio, not Vertex AI. Our adapter omitted this field. The OpenRouter guide does not document forwarding clipping/FPS metadata through that content part. [OpenRouter video API](https://openrouter.ai/docs/guides/overview/multimodal/videos)

Gemini 3.1 Pro supports video/audio input and structured outputs, with a documented 65,536 output-token maximum. Its high thinking setting is a relative allowance, not a guaranteed budget reservation for the final answer. Structured output support does not make observations true. [Model capabilities](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview), [thinking controls](https://ai.google.dev/gemini-api/docs/gemini-3), [validation guidance](https://ai.google.dev/gemini-api/docs/structured-output)

The adapter also hardcodes `temperature: 0.2`. Google recommends the Gemini 3 default `1.0` and warns that lower settings can cause looping or degraded reasoning. This is a confound worth removing, not evidence that it caused our failures. The next native request below leaves temperature at its default. [Google temperature guidance](https://ai.google.dev/gemini-api/docs/gemini-3#temperature)

## Recommended next experiment

Keep Gemini 3.1 Pro and high reasoning, change task decomposition and use **actual clipped input**. Use the native Google `generate_content` route. The official Python SDK defines `VideoMetadata(start_offset, end_offset, fps)`. The official cookbook recommends `generate_content` for custom FPS. There is a documentation inconsistency: the current video guide shows clipping in Interactions, while the cookbook says those controls are not yet supported there. Use the SDK path and test the receipt rather than silently assuming either guide is operationally correct. [SDK types](https://github.com/googleapis/python-genai/blob/main/google/genai/types.py), [Google cookbook](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Video_understanding.ipynb)

Illustrative request shape, not executed in this research pass:

```python
from google import genai
from google.genai import types

client = genai.Client()  # credentials supplied through existing safe runtime
part = types.Part.from_uri(file_uri=PUBLIC_YOUTUBE_URL, mime_type="video/mp4")
part.video_metadata = types.VideoMetadata(
    start_offset="90s", end_offset="150s", fps=2,
)
response = client.models.generate_content(
    model="gemini-3.1-pro-preview",
    contents=[part, "List visible battle state changes only, with original-video timestamps. "
                    "No strategy analysis. Unknown fields null; list unreadable intervals."],
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
        max_output_tokens=32768,
        response_mime_type="application/json",
        response_json_schema=SMALL_EVENT_SCHEMA,
    ),
)
```

The 32,768 ceiling is a bounded experimental allowance, not a recommended universal setting. If this minute still exhausts it, stop and diagnose instead of launching a channel-wide job. Actual acceptance of the exact model/YouTube/metadata combination remains to be tested. Compare video-input tokens with the prior full-video calls and ask an out-of-window control question; neither check alone proves complete clipping.

Proposed extraction stages:

```text
Team report / captions / video chapters
           |
           v
Select ONE battle + associated team explanation
           |
           v
Clipped visual events       Timestamped commentary
           \                 /
            evidence alignment
                    |
      Revealed sets + conditional pilot rules
                    |
       Calculator / rules checks + contradiction review
                    |
        Graph claims linked to exact source intervals
```

A pilot rule should retain `when`, `available_information`, `action`, `intended_effect`, `failure_conditions`, `observed_outcome`, and `source`. Example shape: “When this opposing lead appears, preserve this defensive resource until that threat is removed.” It must distinguish what the player said, what the board showed, and what our agent inferred. Edited-away turns cannot be reconstructed as observations.

## Existing tools that reduce the workload

- **Timestamped captions:** `youtube-transcript-api` exposes text/start/duration and generated-vs-manual metadata, including language selection. It is an unofficial integration and documents blocking/failure cases. It can locate commentary about a matchup before visual extraction. It cannot supply board states, and auto-captions can corrupt Pokémon names. [Maintainer documentation](https://github.com/jdepoix/youtube-transcript-api)
- **Official YouTube captions API:** downloading caption tracks requires permission to edit the video, so it is not a general public-channel transcript API. [YouTube documentation](https://developers.google.com/youtube/data/reference/rest/v3/captions/download)
- **Google cookbook:** useful native video request examples already exist; the missing project-specific work is event alignment and verification. A new general-purpose video framework is unnecessary for the first demo. [Video quickstart](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Video_understanding.ipynb)

An alternative next experiment, if changing model is acceptable, is the documented agentic mode on a supported newer model with a narrow question such as “find every point where the creator explains why this core fails.” That is retrieval-oriented and does not establish exhaustive battle reconstruction. Do not compare its output to static full reconstruction as though they were the same task.

## Coverage and evaluation

Proposed demo gate: independently annotate one short continuous interval and one full battle. Measure event recall and precision separately, timestamp error, species/form errors, state-field accuracy, and unsupported strategic claims. List omitted intervals and edit cuts explicitly. Check all win/loss outcomes and every decisive move in this tiny sample. Track token cost per verified battle, not cost per plausible JSON answer.

An outcome in a selected creator video is a case study, not a matchup win-rate estimate. Keep game version/regulation, upload date, battle date when known, creator and source selection attached. A claim about the meta requires population evidence beyond highlights.

## Numbers observed

| Existing call | Video tokens | Completion tokens | Reasoning tokens | Finish | Cost USD |
|---|---:|---:|---:|---|---:|
| Full, original | 143685 | 5996 | 5759 | length | 0.360260 |
| Full, low thinking | 143685 | 23 | 0 | stop, access denial | 0.288584 |
| Opening prompt, whole input | 143685 | 3157 | 2472 | stop | 0.325500 |
| Full, high thinking | 143685 | 32764 | 31455 | length | 0.681476 |

Total across these receipts: $1.655820. No additional paid calls, complete-media downloads, or frame verification were performed for this note. Seven opening observations exist; they remain unverified.
