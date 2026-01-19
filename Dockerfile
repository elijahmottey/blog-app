FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y libz1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY blog-app .

EXPOSE 8080
ENTRYPOINT ["./blog-app"]
