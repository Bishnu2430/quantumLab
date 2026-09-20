# syntax=docker/dockerfile:1.7
# Execution sandbox image.
#
# Deliberately minimal: an interpreter, the scientific stack the lessons use,
# and nothing else. No shell utilities worth pivoting through, no package
# manager at runtime, no network (enforced by the run flags, not the image).

FROM python:3.12-slim-bookworm

# Pinned so an upstream release cannot silently change what learners execute.
RUN pip install --no-cache-dir --require-hashes=false \
      "numpy==2.3.4" \
      "scipy==1.16.3" \
      "qiskit==2.5.2" \
      "qiskit-aer==0.17.2" \
 && find /usr/local -name "__pycache__" -type d -prune -exec rm -rf {} + \
 && find /usr/local -name "tests" -type d -prune -exec rm -rf {} +

# Matches the --user flag the runner passes; the image must not run as root
# even if the flag is ever omitted.
RUN groupadd --gid 1001 sandbox \
 && useradd --uid 1001 --gid sandbox --no-create-home --shell /usr/sbin/nologin sandbox

USER 1001:1001
WORKDIR /sandbox

# Overridden by the runner, which passes the script path explicitly.
ENTRYPOINT ["python", "-I", "-B"]
