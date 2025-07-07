FROM node:18-alpine AS builder
WORKDIR /app
# Allow overriding API base URL at build time for production deployments
ARG VITE_API_BASE_URL=http://localhost:8000
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]