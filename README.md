# Node.js Owncloud Folder Parser
This is a fun project to parse Owncloud shared folders with Node.js and PhantomJS instead of Owncloud API and return a json. I'm using it to create music playlist and direct stream from Owncloud download urls to a website. You can use the browser user interface or directly parse and save the json with url and path configured in `config.json`.

Exemple based on my shared public folder for my music project (I'm also [music producer](https://www.youtube.com/channel/UCHhdhKc4nOABGdqtEvqpsTw) :smile: ): https://zatanna.useed.fr/SB869/owncloud/index.php/s/FxWBSqPLgkHCrqQ?path=%2FLazerzF!ne

## Configure
You can configure `server\config.json` :

    {
        "userSettings": {
            "defaultUrl": {
                "url": "https://domain.host/owncloud/index.php/s/folder?path=searchquery" //This is the URL to your shared folder if you don't want to use the browser interface, searchquery isn't mandatory
            },
            "thumbnail": {
                "path": "images/covers/", //Optional, i use it for exemple to attach an image path for each files in the json with "thumbnail: path + fileName + extension"
                "extension": ".jpg"
            },
            "saveJsonPath": "./playlist.json" //Path where you want to save the json, dosen't required if you want to use the browser interface
        },
        "serverSettings": {
            "host": "127.0.0.1", //server host for browser interface
            "port": "1337" //server port for browser interface
        }
    }

Init :

    $ npm i
    $ node server/server.js
    
Run server only :

    $ node server/server.js --server

Write json only :

    $ node server/server.js --write-json
