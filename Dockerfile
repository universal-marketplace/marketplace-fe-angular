# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Support build-time API URL configuration
ARG NG_APP_API_URL=https://universal-marketplace-be.azurewebsites.net/api/v1
ENV NG_APP_API_URL=$NG_APP_API_URL

# Run the build (triggers set-env.js automatically via prebuild)
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx default html directory
COPY --from=builder /app/dist/universal-marketplace-fe/browser /usr/share/nginx/html

# Expose port 80 (standard HTTP port for Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
