FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app

RUN microdnf install -y git zip unzip findutils

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

RUN chmod +x gradlew
RUN ./gradlew nativeCompile --no-daemon

FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["./blog-app"]
