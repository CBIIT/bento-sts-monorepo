FROM python:3.14.4-alpine3.23

EXPOSE 8000/tcp

WORKDIR /app

# Fix OpenSSL CVEs (CVE-2026-31790, CVE-2026-2673) via apk upgrade -> openssl>=3.5.6-r0
# Fix curl CVE-2026-3805 (use-after-free in SMB reuse) from Alpine edge -> curl>=8.19.0
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache 'openssl>=3.5.6' && \
    apk add --no-cache -X https://dl-cdn.alpinelinux.org/alpine/edge/main 'curl>=8.19.0'

# Replace pip with uv and remove pip to eliminate PRISMA-2022-0168
RUN pip install --no-cache-dir uv && \
    pip uninstall -y pip

# Install the checked-out backend source from the Docker build context.
COPY pyproject.toml README.md ./
COPY src ./src
RUN uv pip install --no-cache --system .

ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /sbin/nologin -D appuser

USER appuser
ENTRYPOINT ["uvicorn"]
CMD ["bento_sts.sts:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]