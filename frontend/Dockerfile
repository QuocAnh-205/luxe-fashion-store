# frontend/Dockerfile
# LUXE Fashion Store - Frontend (React + Vite), build & phục vụ bằng Nginx

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# URL của backend, sẽ được "nướng" (bake) vào bundle lúc build vì Vite đọc
# biến VITE_* tại build-time, không phải runtime.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Render (và nhiều PaaS khác) chỉ định cổng lắng nghe qua biến PORT lúc runtime,
# nên ta dùng envsubst để render lại file config nginx mỗi khi container start.
ENV PORT=80
EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$PORT $BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]