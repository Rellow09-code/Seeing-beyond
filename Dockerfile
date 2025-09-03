FROM node:18

WORKDIR /app

# Copy everything into container
COPY . .

# Build backend
RUN cd backend && npm install && npm run build

# Build frontend
RUN cd client && npm install && npm run build

# ✅ Copy React build into backend/dist/client
RUN mkdir -p backend/dist/client && cp -r client/dist/* backend/dist/client/

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
