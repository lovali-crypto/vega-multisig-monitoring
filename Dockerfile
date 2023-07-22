FROM node:bullseye-slim AS build
WORKDIR /usr/src/app
COPY ./index.js /usr/src/app
COPY ./package.json /usr/src/app
RUN npm install

FROM gcr.io/distroless/nodejs
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app
CMD ["index.js"]