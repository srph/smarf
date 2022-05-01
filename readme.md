![Thumbnail](readme-thumb.png)

## Smarf (WIP)

Smarf is a dota hero organizer on your browser

## Requirements

- npm v16
- Docker

### Running API

Go to the `/api` directory. Install the dependencies with:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/var/www/html \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs
```

Afterwards, run:

```bash
./vendor/bin/sail up
```

Run migrations and seed data:

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed
```

### Running UI

Go the `/ui` directory, then run:

```bash
npm install && npm start
```

The base username and password is `hi@admin.com` / `password`