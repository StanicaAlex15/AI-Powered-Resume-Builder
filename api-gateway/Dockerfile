# Use the official Nginx image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to be able to access the API Gateway
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
