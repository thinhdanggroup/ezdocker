const reactAppTemplate = "FROM node:8 |# Override the base log level (info). |ENV NPM_CONFIG_LOGLEVEL warn |# Install and configure `serve`. |RUN npm install -g serve |# Install all dependencies of the current project. |COPY package.json package.json |COPY package-lock.json package-lock.json |RUN npm install |# Copy all local files into the image. |COPY src src |COPY public public |# Build for production. |RUN npm run build --production |PORT|CMD"

module.exports = {
  reactAppTemplate
}