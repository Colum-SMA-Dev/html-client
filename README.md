# html-client
A client for displaying MediaScenes in html.  Should work on any HTML5 Device.



## Development

After cloning the repository, install the dependencies:

```
npm install
```

Copy the example environment file and edit as you'd like.  

```
cp env-example.sh env.sh
```

Here's what they do:
* `VIMEO_ACCESS_TOKEN` - Token aquired from Vimeo to use their API.  You'll need to get one
* `SOUNDCLOUD_CLIENT_ID` - Same deal, but for soundcloud.
* `PORT` - Port that the development server will run on.  This only applies in development, you probably don't want to set this in production, unless you're 
* `NODE_ENV` - Set to 'development', otherwise the built version of the project will have minified javascript.  Not always what you want when developing.

Make it executable

```
chmod 755 env.sh
```

Then, run

```
./env.sh gulp
```

That will create a `dist/` directory where a built version of the project will be kept, and it will also kick up a small webserver to serve those files (with livereload).  Additionally, gulp will watch for changes and rebuild when needed.

## Deployment

Follow all of the development steps.  However, depending on your hosting environment, it may make more sense to configure the environment variables through their UI rather than the `env.sh` shell script.  

Also, rather than running just `gulp`, use `gulp build`.  This will just build out the files to `dist/` where you can do what you like with them.