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

Create .env file:

```
cp .env.example .env
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

Install Passport keys and and create client id/secret:

```
sail artisan install
sail artisan passport:client --password
```

Copy the output's client id and secret.

### Running UI

Go the `/ui` directory. Create .env file:

```
cp .env.example .env
```

Open .env and set `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` based on Passport's output.

Afterwards, install dependencies and run Parcel:

```bash
npm install && npm start
```

### Create an Admin User

Go back to the `/api` directory, then run:

```bash
php artisan smarf:admin
```

## Why?

This _recreates_ the in-game hero organizer for the web.

I'm an avid smurfer; I'm not really sorry. Unlike a lot of spamming boosters, I pick a wide variety of heroes and roles. Whenever I switch accounts, it's hard for me to pick some heroes I prefer per lane / style.

You might ask: why go all this trouble? I've had this idea for a couple of years. Now that I'm currently taking a break, I thought it would be fun to work on. This would also allow me to showcase the skills I've learnt from similar projects at my previous jobs. Lastly, it would be cool to apply some React patterns I tried a couple of times at my last work.

In the future, I think it'd be cool to allow folks to share their hero boards with their friends. What's even cooler would be to allow casual teams going into tournaments to organize their team's picks. Maybe.
