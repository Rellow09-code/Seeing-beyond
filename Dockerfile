# Use Node LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json files first for caching dependencies
COPY backend/package.json backend/package-lock.json ./backend/
COPY client/package.json client/package-lock.json ./client/

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies
RUN cd client && npm install

# Copy the rest of the files
COPY . .

# Build backend
RUN cd backend && npm run build

# Build frontend
RUN cd client && npm run build

# Expose port (backend listens on this port)
EXPOSE 5000

# Start the backend
CMD ["node", "backend/dist/server.js"]
