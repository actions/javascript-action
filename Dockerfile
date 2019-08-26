FROM node:slim

COPY . .

RUN npm install --production

ENTRYPOINT ["node", "/lib/main.js"]
