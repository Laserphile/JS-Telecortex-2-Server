# Bun's linux-aarch64 build targets the Cortex-A53, so this runs on a Raspberry Pi 3 with the 64-bit balenaOS.
# The image is pinned by digest so every build gets the same one.
FROM oven/bun:1.4.2-slim@sha256:cb3bbbb08e13a4a2ff400f24c7a2a1d5efa83f6ef8544d52d95a519631e2fc61

WORKDIR /app
# The server has no runtime dependencies, so there is nothing to install
COPY package.json tsconfig.json ./
COPY src ./src

CMD ["bun", "src/main.ts"]
