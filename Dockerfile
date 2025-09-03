FROM node:18

WORKDIR /app

# Copy everything into /app
COPY . .

# Build backend
RUN cd backend && npm install && npm run build

# Build client
RUN cd client && npm install && npm run build

# Copy client build into backend/dist/client so Express can serve it
RUN cp -r client/dist backend/dist/client

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
