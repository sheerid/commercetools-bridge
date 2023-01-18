FROM node:17.0-slim
COPY . .
RUN date | tr -d '\n' > build-date.txt
RUN npm install
EXPOSE 80/tcp
CMD [ "node", "server.js" ]
