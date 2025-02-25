# Gunakan image resmi Node.js sebagai base image
FROM node:18-alpine

# Tentukan direktori kerja dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file proyek ke dalam container
COPY . .

# Expose port yang digunakan oleh Express.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "server.js"]
