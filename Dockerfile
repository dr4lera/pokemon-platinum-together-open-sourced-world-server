FROM node:24-bookworm-slim
WORKDIR /app
COPY --chown=node:node *.mjs package.json LICENSE THIRD_PARTY_NOTICES.md /app/
COPY --chown=node:node vendor/ /app/vendor/
COPY --chown=node:node examples/ /app/examples/
USER node
STOPSIGNAL SIGTERM
CMD ["node", "main.mjs", "serve", "--config", "/config/server.json"]
