FROM node:14-alpine as base
RUN apk add build-base python3-dev gcc musl-dev postgresql-dev geos
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN pip3 install pipenv
WORKDIR /usr/local/app/backend
COPY backend .
RUN pipenv install --system
ENV PYTHONPATH=/usr/local/app/backend/src
COPY ./backend/scalegrid.crt /etc/ssl/certs/scalegrid.crt
EXPOSE 5001

FROM base as scrapper
ENTRYPOINT ["sh", "entrypoint.sh", "scrapper"]

FROM base as app
RUN apk --no-cache add nodejs yarn --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
WORKDIR /usr/local/app/frontend
COPY frontend .
RUN yarn install && yarn build
WORKDIR /usr/local/app/backend
ENTRYPOINT ["sh", "entrypoint.sh", "app"]