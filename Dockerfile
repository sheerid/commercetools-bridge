FROM node:17.0-slim
COPY . .
RUN npm install
EXPOSE 80/tcp
CMD [ "node", "server.js" ]
