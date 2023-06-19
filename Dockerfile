FROM node:20.0.0

ENV APP_NAME revotraffic

RUN apt-get update -qqy && \
    apt-get install -y ttf-wqy-microhei && \
    apt-get install -y ttf-wqy-zenhei && \
    apt-get install -y libxss1 && \
    apt-get install -y libxtst6 

WORKDIR /revotraffic
COPY . /revotraffic
RUN yarn install && \
    yarn build && \
    if [ -n "${APP_VERSION}" ]; then yarn install --production; fi

RUN yarn global add serve

EXPOSE 3000
CMD serve -p 3000 -s build
# CMD yarn start