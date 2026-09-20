# syntax=docker/dockerfile:1.7
# Execution sandbox image.
#
# Deliberately minimal: an interpreter, the scientific stack the lessons use,
# and nothing else. No shell utilities worth pivoting through, no package
# manager at runtime, no network (enforced by the run flags, not the image).

FROM python:3.12-slim-bookworm

# Pinned so an upstream release cannot silently change what learners execute.
# Versions pinned so an upstream release cannot silently change what learners
# execute. Caches and test suites are stripped to keep the image small.
RUN pip install --no-cache-dir       "numpy==2.3.4"       "scipy==1.16.3"       "qiskit==2.5.2"       "qiskit-aer==0.17.2"  && find /usr/local/lib/python3.12 -type d -name "__pycache__" -exec rm -rf {} +  && find /usr/local/lib/python3.12 -type d -name "tests" -exec rm -rf {} +  && rm -rf /root/.cache

# Matches the --user flag the runner passes; the image must not run as root
# even if the flag is ever omitted.
RUN groupadd --gid 1001 sandbox \
 && useradd --uid 1001 --gid sandbox --no-create-home --shell /usr/sbin/nologin sandbox

USER 1001:1001
WORKDIR /sandbox

# No ENTRYPOINT on purpose. The runner passes the full command, so the
# interpreter flags live next to the security flags rather than being split
# across the image and the caller -- where they previously combined into
# `python -I -B python -I -B main.py`.
CMD ["python", "-c", "print('Provide a script to run.')"]
