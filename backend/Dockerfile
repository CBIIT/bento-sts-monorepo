# syntax=docker/dockerfile:1.7
FROM python:3.13.11-alpine3.23

EXPOSE 8000/tcp

WORKDIR /app

RUN --mount=type=secret,id=nci_ca,required=false \
    set -eux; \
    if [ -f /run/secrets/nci_ca ]; then \
        cp /run/secrets/nci_ca /usr/local/share/ca-certificates/nci-ca.crt; \
        update-ca-certificates; \
    fi; \
    apk upgrade --no-cache; \
    if [ -f /usr/local/share/ca-certificates/nci-ca.crt ]; then \
        rm /usr/local/share/ca-certificates/nci-ca.crt; \
        update-ca-certificates --fresh; \
    fi

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
