FROM node:14
EXPOSE 3000 9229

COPY package*.json ./
RUN npm ci

COPY . .


CMD [ "npm", "start" ]