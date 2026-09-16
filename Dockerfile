FROM python:3.12-alpine

WORKDIR /app

COPY server.py /app/server.py
COPY data /app/data
COPY public /app/public

RUN mkdir -p /app/data/runtime

ENV PORT=80 \
    PYTHONUNBUFFERED=1

EXPOSE 80

CMD ["python", "-u", "server.py"]
