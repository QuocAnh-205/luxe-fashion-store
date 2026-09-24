# backend/Dockerfile
# LUXE Fashion Store - Backend (Node.js + Express)

FROM node:20-alpine

WORKDIR /app

# Cài dependencies trước để tận dụng cache của Docker
COPY package*.json ./
RUN npm install --omit=dev

# Copy toàn bộ source code backend (bao gồm cả db.json)
COPY . .

ENV NODE_ENV=production
# Render sẽ tự inject biến PORT lúc chạy container.
# Đảm bảo server.js/index.js của bạn dùng: const PORT = process.env.PORT || 5000
EXPOSE 5000

CMD ["npm", "start"]
