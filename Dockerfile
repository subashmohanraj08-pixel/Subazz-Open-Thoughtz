# --- Subaz Open Thoughtz backend image ---
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy the rest of the backend source
COPY . .

# Uploaded media is written here at runtime - mount a volume over this in compose
RUN mkdir -p uploads/images uploads/videos uploads/avatars

EXPOSE 5000

CMD ["node", "server.js"]
