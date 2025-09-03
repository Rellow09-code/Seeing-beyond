FROM node:18

WORKDIR /app

COPY . .

# Install backend deps
RUN cd backend && npm install && npm run build

# Install client deps and build
RUN cd client && npm install && npm run build

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
