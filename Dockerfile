FROM node:18

WORKDIR /app

# Copy everything
COPY . .

# Install backend deps and build backend
RUN cd backend && npm install && npm run build

# Install client deps and build client
RUN cd client && npm install && npm run build

# Copy client build into backend/dist so your express.static can find it
RUN cp -r client/dist backend/dist/client

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
