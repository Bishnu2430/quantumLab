# Execution sandbox

The image that runs learner and researcher code.

Built by `docker compose build sandbox`, or directly:

```bash
docker build -t pbquantum/sandbox:latest apps/sandbox
```

## What constrains it

The image itself carries no privileges. Isolation comes from the flags the API
passes on every `docker run`, in `app/services/execution/docker_runner.py`:

| Flag | Effect |
| --- | --- |
| `--network none` | No network namespace at all |
| `--memory`, `--memory-swap` | Equal values, so the cap cannot be evaded via swap |
| `--cpus` | CPU share ceiling |
| `--pids-limit` | Stops fork bombs |
| `--read-only` | Root filesystem is immutable |
| `--tmpfs /tmp` | The only writable surface, size-capped, `noexec` |
| `--cap-drop ALL` | No Linux capabilities |
| `--security-opt no-new-privileges` | setuid binaries cannot escalate |
| `--user 1001:1001` | Never root |
| `--rm` | Container and its writes are destroyed on exit |

The script is mounted read-only. Nothing survives one execution into the next.
