FROM node:20
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn run build
EXPOSE 3000
CMD ["yarn", "start"]