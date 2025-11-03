# =======================================================
# 🧱 STAGE 1: Build application
# =======================================================
FROM node:18-alpine AS build
WORKDIR /app

# 1️⃣ Copy file package.json và package-lock.json trước
# => Giúp Docker cache được layer cài dependency
COPY package*.json ./

# 2️⃣ Cài dependency (clean install)
# npm ci giúp build ổn định, không mang node_modules từ local
RUN npm ci

# 3️⃣ Copy toàn bộ mã nguồn vào container
COPY . .

# 4️⃣ Build project (vite sẽ tạo thư mục dist)
RUN npm run build


# =======================================================
# 🚀 STAGE 2: Run app với Nginx
# =======================================================
FROM nginx:stable-alpine

# 5️⃣ Xóa file cấu hình mặc định của Nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# 6️⃣ Copy cấu hình SPA (giúp reload không 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 7️⃣ Copy thư mục build từ stage 1 sang
COPY --from=build /app/dist /usr/share/nginx/html

# 8️⃣ Expose port 80
EXPOSE 80

# 9️⃣ Lệnh mặc định
CMD ["nginx", "-g", "daemon off;"]
