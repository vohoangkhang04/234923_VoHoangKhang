# Su dung Node.js
FROM node:24-alpine

# Thu muc lam viec trong container
WORKDIR /app

# Cau hinh moi truong production
ENV NODE_ENV=production

# Sao chep cac file quan ly dependencies
COPY package.json package-lock.json ./

# Cai dat dependencies production
RUN npm ci --omit=dev

# Sao chep ma nguon backend
COPY server.js ./
COPY src ./src

# Chay ung dung bang user khong co quyen root
USER node

# Cong backend
EXPOSE 5000

# Khoi dong server
CMD ["node", "server.js"]