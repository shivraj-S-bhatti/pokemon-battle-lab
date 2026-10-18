# Local database persistence correction, October 18

Starting the separate Browser service recreated the graph container and exposed an existing persistence misconfiguration. The old Compose `command` was ignored by the image entrypoint. Redis wrote to `/var/lib/falkordb/data`, while the named volume was mounted at `/data`; AOF was disabled. Recreating the container lost the unpersisted catalog and earlier workbench analysis history.

The catalog was restored from the saved export with `npm run ingest`. Authored workbench cases were reseeded; earlier run history was not recovered. A graph name existing was initially mistaken for a completed import; node counts exposed that error.

Compose now sets `FALKORDB_DATA_PATH=/data` and `REDIS_ARGS=--appendonly yes`, which the pinned image entrypoint uses. A saved RDB was migrated to the mounted directory and AOF enabled. A subsequent container restart preserved 3,877 catalog nodes, 151,201 catalog relationships and 210 seeded workbench nodes. Sprite metadata was applied afterward. Local backup: `.artifacts/workbench/db-recovery/dump.rdb`.

The Browser is independently recreated with `--no-deps browser`. Both exposed ports bind to 127.0.0.1. No password was added and the database remains writable. Native Browser is at port 4319; Redis is at 6388. The old workbench server was restarted to reconnect after database recovery.
