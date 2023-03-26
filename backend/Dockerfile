FROM buildkite/puppeteer

LABEL version="1.0"
LABEL description="Backend for OMM Meme Application WS2020"

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN apt-get update && apt-get install -y ffmpeg

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]