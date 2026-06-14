FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

ENV MCP_TRANSPORT=streamable-http
ENV MCP_PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const net=require('net');const s=net.createConnection(8000,'localhost',()=>{s.destroy();process.exit(0)});s.on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]
