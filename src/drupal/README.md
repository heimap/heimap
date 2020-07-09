# HeiMap Drupal source code and development environment with Docker #

Quick and easy to use Docker container for the heiMap *local Drupal development*. It contains a set of servers/services and tools that allow us to make a good and professional development. It is based on [Debian Stretch](https://wiki.debian.org/DebianStretch).

>Summary
-------

What is Docker? "Docker allows you to package your application with all of its dependencies into a standardized unit called container." When launching, the container will contain a pre-configured Drupal site (only requiring site definitions).

To understand what is Docker, its concepts and how to use it you can read:
[6 Reasons To Deploy Drupal 8 With Docker](https://blog.wodby.com/6-reasons-to-deploy-drupal-8-with-docker-how-to-guide-b2f073e61672). Don't go ahead in the section 'Let’s rock!' because we use a different setup.
There is a very good book for beginners: [Docker for developers book](https://leanpub.com/docker-for-developers). 

Of course you can go to the official docs: [Docker get started page](https://docs.docker.com/get-started/)  and the drupal pages dedicated to Docker based development: [Docker based development environment](https://www.drupal.org/node/2736447). 

>Tutorial
--------------

This tutorial includes instructions to help you instal Docker, build the project image and run the docker machine, as well as information about how to use the tools included in the solution.

>Installing Docker
------------

The Docker solution is composed of three softwares: Docker Engine, Docker Compose and Docker Machine. We need to install the three.

Purge any other previous/old docker installation:

```sh
sudo apt-get purge -y docker-engine
sudo apt-get autoremove -y --purge docker-engine
sudo apt-get autoclean
```

To install the docker engine, in your terminal, run one of the following commands:

For version 18.05.0. Preferred version for ubuntu. More @ https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1. Check ubuntu/debian specific docker versions by hitting `$ apt-cache madison docker-ce`

```sh
sudo su
sudo -E sh -c "apt-get install -y -qq -no-install-recommends docker-ce=18.05.0~ce~3-0~ubuntu >/dev/null"
exit
sudo usermod -a -G docker $USER
su - $USER
```

For latest version - However, it has been reported that other versions of docker fail to download layers from the geoserver container on some OSs.

```sh
sudo su
wget -qO- https://get.docker.com/ | sh
exit
sudo usermod -a -G docker $USER
su - $USER
```

To test if docker engine was installed run the command below. If it is, the hello-world docker container will say it explicitly.  Just read the screen!

```sh
docker run hello-world
```

To instal the docker composer, in your terminal, run the following commands:

```sh
sudo su
curl -L https://github.com/docker/compose/releases/download/1.6.2/docker-compose\
-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

To test if docker compose was installed run the command below (you must see the version):

```sh
docker-compose version
```

To instal the docker machine, in your terminal, run the following commands:

```s
curl -L https://github.com/docker/machine/releases/download/v0.6.0/docker-machine\
-`uname -s`-`uname -m` > /usr/local/bin/docker-machine && \
chmod +x /usr/local/bin/docker-machine
```

To test if docker compose was installed run the command below (you must see the version):

```sh
docker-machine version
```

**Now Logout and login again in your machine. Don't forget it!**

>Getting the project

Clone the repository locally:

```sh
git clone -b develop https://gitlab.urz.uni-heidelberg.de/heimap/heimap.git heimap
```

*Remember that you have to checkout in the develop branche, which is the working branche*  

### Repository workflow good practices ###

The repository workflow for the project have two main branches:

 * master (where the stable/production versions are stored)
 * develop (where the working versions are stored)
 * feature/my-feature-name (local only branches of a working feature)

When somebody is working on a feature, this person should create a local branch. This local branch should be named 'feature/my-feature-name'. When the developer ends and testes the feature, he/she should commit it in the 'feature/my-feature-name', check out in the 'develop' branch, pull it from the server, make a merge from 'feature/my-feature-name' and then push this. In general cases, the branch 'feature/my-feature-name' should exist only in the local repository.

When a version is about to be released to the client, it should receive a tag, with the version number. 

*Only when a version is approved to go the production server, we check out in the 'master' branch and make a merge from the branch 'develop'.*

>Building the image

The docker image we are gonna create to setup the environment using docker wil contains:

* Apache 2.4
* Postgres 9.5
* Postgresql Client
* Postgis 2.2
* Postgis Scripts
* PHP 7.0
* Drush 8  - a [command line interface for Drupal](http://docs.drush.org/en/master/)
* The latest release of [Drupal Console](https://drupalconsole.com/)
* Drupal 8.3.6
* Composer  - [A tool for dependency management in PHP](https://getcomposer.org/doc/00-intro.md)
* PhpPgAdmin - [Web application to manage Postgres databases](https://github.com/phppgadmin/phppgadmin)
* Blackfire - [A free PHP profiling tool](https://blackfire.io)
* Supervisor [A tool to monitor and control a number of processes](http://supervisord.org/)
* wget
* unzip
* cron
* gnupg - [To encrypt and sign your data](http://do.co/29H6Lof)
* Cur
* Openssh Server
* Gdal (Geospatial Data Abstraction Library)
* Python Pip
* PHP CLI
* PHP mbstring
* php GD
* PHP Curl
* PHP Xdebug (to debug PHP applications)
* PHP sqlite3
* PHP XML
* Vim
* Nano
* Git
* NodeJS

Go to the heimap folder dir running:

```sh
cd heimap
```

Build the docker image running (dnt forget the final dot "."):

```sh
docker build -t heimap-server-image .
```

*If the docker daemon can not resolve some dsn, follow this guide*:
[Docker build could not resolve DNS](https://stackoverflow.com/questions/24991136/docker-build-could-not-resolve-archive-ubuntu-com-apt-get-fails-to-install-a)

>Running it

The container exposes its `80` and `443` ports (Apache), its `5432` port (Postgres) and its `22` port (SSH). Make good use of this by forwarding your local ports. You should at least forward to port `80` (using `-p 8080:80`, or like `-p 80:80`). A good idea is to also forward port `22`, so you can use Drush from your local machine using aliases, and directly execute commands inside the container, without attaching to it.

To run, just built image as a container the first time, execute:

```sh
docker run --name heimap-server-container \
-p 8080:80 -p 5434:5432 -p 8022:22 \
-v $PWD/drupal_src/modules/custom:/var/www/modules/custom \
-v $PWD/webapp/:/var/www/webapp \
-d heimap-server-image
```

In case you need to set custom Geoserver endpoints (NOTE that GEOSERVER_REST_BASE_URL, GEOSERVER_OWS_BASE_URL and GEOSERVER_BASE_URL are optional and, if not defined, will get assigned from .env file):

docker run  --env=GEOSERVER_REST_BASE_URL=http://172.17.0.1:8081/geoserver/rest --env=GEOSERVER_OWS_BASE_URL=http://0.0.0.0:8081/geoserver/ows?  --env=GEOSERVER_BASE_URL=http://0.0.0.0:8081/geoserver --name heimap-server-container \
-p 8080:80 -p 5434:5432 -p 8022:22 \
-v $PWD/drupal_src/modules/custom:/var/www/modules/custom \
-v $PWD/webapp/:/var/www/webapp \
-d heimap-server-image

## Configuration

You can configure the backend by editing `drupal_src/env/.env`.  Alternatively you can override the settings in these files by setting environment variables for the backend process.  Using Docker this could e.g. be done by inserting `--env=NAME=value` command line arguments after `docker run`.

## Geo Server

After this, create/run the Geoserver container:
Note: We need the following postgis container for geoserver, and not for our vector data storage. HeiMap docker container provides another postgis for vector storage

```sh
sudo docker run --name "postgis" -d -t kartoza/postgis
sudo docker run --name "geoserver"  --link postgis:postgis -p 8081:8080 -d -t kartoza/geoserver
```

**Enable GeoWebCache Tiling in GeoServer**

* Go inside the geoserver running container

```sh
docker exec -it geoserver bash
```

* Edit gwc-gs.xml file to enable tiling

```sh
apt-get update
apt install --reinstall sed
sed -i -e 's/<directWMSIntegrationEnabled>false<\/directWMSIntegrationEnabled>/<directWMSIntegrationEnabled>true<\/directWMSIntegrationEnabled>/g' /opt/geoserver/data_dir/gwc-gs.xml
```

* Exit container

```sh
exit
```

* NOTE - For Development, enable CORS in Geoserver

Edit file /usr/local/tomcat/webapps/geoserver/WEB-INF/web.xml inside Geoserver Docker container

```
<filter>
  <filter-name>CorsFilter</filter-name>
  <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
  <init-param>
    <param-name>cors.allowed.origins</param-name>
    <param-value>*</param-value>
  </init-param>
</filter>
<filter-mapping>
  <filter-name>CorsFilter</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

* Enable "Enable direct integration with GeoServer WMS" checkbox by visiting "Tile Caching/Caching Defaults" section of the Geoserver to start caching WMS tiles.

* Create workspace "public" and "vector" - NOTE that here localhost might point to geoserver domain in production

```sh
curl -v -u admin:geoserver -XPOST -H "Content-type: text/xml" -d "<workspace><name>public</name></workspace>" http://localhost:8081/geoserver/rest/workspaces
curl -v -u admin:geoserver -XPOST -H "Content-type: text/xml" -d "<workspace><name>vector</name></workspace>" http://localhost:8081/geoserver/rest/workspaces
```

* Create data store "vector" for vector schema of drupal DB - NOTE the file vector_data_store.xml is located inside /drupal_src/modules/custom/heimap/env/ dir. Modify it accordingly per requirement. Also NOTE that here localhost might point to geoserver domain in production

```sh
curl -v -u admin:geoserver -X POST -H "Content-type: text/xml" -T ./drupal_src/modules/custom/heimap/env/vector_data_store.xml http://localhost:8081/geoserver/rest/workspaces/vector/datastores.xml
```

**Add serialization and heimap Extend to Drupal Project**

* After running it, go to the browser in localhost:8080 and define the admin user of Drupal and other regional settings. After finishing it, run:

```sh
docker exec -it --user root heimap-server-container bash
```

You will be inside the Docker.

* Then run:

```sh
composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader --sort-packages -n
```

PHP SQL Query Builder - https://github.com/nilportugues/php-sql-query-builder

```sh
composer require nilportugues/sql-query-builder
```

Install Drupal CORS Module  - 

```sh
composer require drupal/cors:^1.0
```

* Then run:

```sh
drush en -y serialization
drush en -y heimap
drush en -y geofield
drush en -y cors
```

* Enable Drupal CORS Module: Allow User-Login Post requests by adding the following line at "http://localhost:8080/admin/config/services/cors" (Change localhost to the correct IP address for User-Login)

```sh
*|http://localhost:4201|POST|*|false
```

* Then run:

```sh
drupal router:rebuild
```

* Exit container

```sh
exit
```

### Pre-populate Vector Database for testing

```sh
bash ./drupal_src/modules/custom/heimap/src/tests/vectorAPI/prepopulateDb.sh localhost:8080
```

### Run Gulp on Development Environment ###

In order to run the gulp for auto building package, follow the following step

#### Linux/MacOS ####
* Enter inside docker container of heimap

```sh
docker exec -it --user root heimap-server-container bash
```

* Enter inside webapp folder

```sh
cd webapp/
```

* Run gulp

```sh
gulp
```

#### If MacOS throws "bash: gulp: command not found" error ####
* Enter inside docker container of heimap

```sh
docker exec -it --user root heimap-server-container bash
```

* Remove existing node package, which should be version 4.*

```sh
apt-get purge nodejs
```

* Go to root dir

```sh
cd ~
```

* Download installation script for node version 6.* - https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04

```sh
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
```

* Run the script

```sh
bash nodesource_setup.sh
```

* Install node again

```sh
apt-get install nodejs
```

* Check node version, which should be 6.*

```sh
nodejs -v 
```

* Check also npm version

```sh
npm -v
```

* Go to package.json dir

```sh
cd /var/www/webapp
```

* Install missing npm packages

```sh
npm install
```

* Install gulp

```sh
npm install --global gulp
```

* Run gulp

```sh
gulp
```

### Important ###

The "docker run" command must be used only the first time you want to run a image. To stop the container, execute "docker stop heimap-server-container". To run it again, type "docker start heimap-server-container". Remember, only use "docker run ..." once per image. The commands in sequence are:

```sh
docker run --name heimap-server-container #...and the rest of the command
docker stop heimap-server-container
docker start heimap-server-container
```

Then use docker stop and start every time you need. To check if the container is running, just execute:

```sh
docker ps -a
```

### Passwords ###

* Drupal: the user and passwords you define the first time you open Drupal
* Pgsql: `root:` (no password); `drupal:drupal`
* SSH: `root:root`

### Exposed ports ###

* 80 and 443 (Apache)
* 22 (SSH)
* 5432 (Postgres)

### Environment variables ###

If you wish to enable [Blackfire](https://blackfire.io) for profiling, set the following environment variables:

* `BLACKFIREIO_SERVER_ID`: Your Blackfire server ID
* `BLACKFIREIO_SERVER_TOKEN`: Your Blackfire server token

### Go inside ###

To go inside the virtual machine e execute commands there, just type:

```sh
docker exec -it --user root heimap-server-container bash
```

### Writing code locally ###

All the files and codes concerning our project must be put into the folders:

 * /drupal_src/modules/custom
 * /webapp

This folders are mapped to the container where Drupal resides, so will be part of it. So, we just need to save/version the files that are in theses folders.

Read the [WebApp README](webapp/README.md)!

### Debugging source code with XDebug ###

We can debug our source code using Xdebug component, that is already installed in the Docker image. To do so, you need to use an editor/IDE that supports a XDebug plugin. We do recommend [VSCode](https://code.visualstudio.com/Download). It's really great tool and works on Linux, Windows and Mac.

You just need to configure the debug in you IDE/Text editor. If you are using VSCode:
* Press F1, type *ext install php-debug* and hit enter.
* After that just, click in the debug icon in the left side bar, then click in the gear, select PHP. Be sure that your launcher.json file has the following content:

```json
{  
	"version": "0.2.0",
	"configurations": [
		{  
			"name": "Listen for XDebug",
			"type": "php",
			"request": "launch",
			"port": 9000,
			"serverSourceRoot": "/var/www",
			"localSourceRoot": "${workspaceRoot}/drupal_src"
		},
		{  
			"name": "Launch currently open script",
			"type": "php",
			"request": "launch",
			"program": "${file}",
			"cwd": "${fileDirname}",
			"port": 9000
		}
	]
} 
```

 Save the launcher.json. Restart VSCode. 

To debug a source code just open a .php file inside /src, click before the line number (in the left side) and run some request/url that should execute this php file.

*Important: if your host ip change, you need to run this configuration again* 

**If debug does not work**
- Check the ip configured inside the container in xdebug.remote_host is the same of your host
- Stop/start the docker container
- Close/open the VSCode/IDE
- Check you are not viewing a cached page. You can run, inside the container: "drush cr" to clear the cache

### Using Drush ###

*In the below text we use the initials 'hsc' to refer to heimap-server-container. We are gonna use 'hsc' because it is shorter and we dont to waste time type heimap-server-container every time for the command below!*

Using Drush aliases, you can directly execute Drush commands locally and have them be executed inside the container. Create a new aliases file in your home directory and add the following:

```php
# ~/.drush/docker.aliases.drushrc.php
<?php

$aliases['hsc'] = array(
	'root' => '/var/www',
	'remote-user' => 'root',
	'remote-host' => 'localhost',
	'ssh-options' => '-p 8022', // Or any other port you specify when running the container
);
```

Next, if you do not wish to type the root password every time you run a Drush command, copy the content of your local SSH public key (usually `~/.ssh/id_rsa.pub`; read [here](https://help.github.com/articles/generating-ssh-keys/) on how to generate one if you don't have it). SSH into the running container:
```sh
# If you forwarded another port than 8022, change accordingly.
# Password is "root".
ssh root@localhost -p 8022
```

Once you're logged in, add the contents of your `id_rsa.pub` file to `/root/.ssh/authorized_keys`. Exit.

You should now be able to call:

```sh
drush @docker.hsc cc all
```

This will clear the cache of your Drupal site. All other commands will function as well.

### Using Drupal Console ###

*Important: before using drupal console you must access the container via docker exec and run, inside the /var/www folder the following line of code:*

	composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader --sort-packages -n

Similarly to Drush, Drupal Console can also be run locally, and execute commands remotely. Create a new file called `~/.console/sites/docker.yml` and add the following contents:

```sh
# ~/.console/sites/docker.yml
hsc:
	root: /var/www
	host: localhost
	port: 8022 # Or any other port you specify when running the container
	user: root
	console: drupal
```
You can now call something like:
```sh
drupal --target=docker.hsc:download ctools 8.x-3.0-alpha19
```

You can find more information about Drupal Console [in the official documentation](https://hechoendrupal.gitbooks.io/drupal-console/content/en/using/how-to-use-drupal-console-in-a-remote-installation.html).

### Running tests ###

If you want to run tests, you may need to take some additional steps. Drupal's Simpletest will use cURL to simulate user interactions with a freshly installed site when running tests. This "virtual" site resides under `http://localhost:[forwarded port]`. This gives issues, though, as the *container* uses port `80`. By default, the container's virtual host will actually listen to *any* port, but you still need to tell Apache on which ports it should bind. By default, it will bind on `80` *and* `8080`, so if you use the above examples, you can start running your tests straight away. But, if you choose to forward to a different port, you must add it to Apache's configuration and restart Apache. You can simply do the following:

	
```sh
# If you forwarded to another port than 8022, change accordingly.
# Password is "root".
ssh root@localhost -p 8022
```
	
```sh
# Change the port number accordingly. This example is if you forward
# to port 8081.
echo "Listen 8081" >> /etc/apache2/ports.conf
/etc/init.d/apache2 restart
```

Or, shorthand:

	ssh root@localhost -p 8022 -C 'echo "Listen 8081" >> /etc/apache2/ports.conf && /etc/init.d/apache2 restart'

If you want to run tests from HTTPS, though, you will need to edit the VHost file `/etc/apache2/sites-available/default-ssl.conf` as well, and add your port to the list.

### PhpPgAdmin and PgSql

PHPMyAdmin is available at `localhost:8080/phppgadmin`. 
The PgSql port `5434` is exposed and Mapped to `5432`. The account is `drupal`  and pass `drupal`.
*Important: The version of PhpPGAdmin available in the debian repository is not updated to work 100% with PHP7.0.
It throws some warnings and deprecated at the first load of the page, but they disappear after.
As soon as PhpPGAdmin is updated to be 100% compatible with PHP7.0, we will update it.*

### Blackfire

[Blackfire](https://blackfire.io) is a free PHP profiling tool. It offers very detailed and comprehensive insight into your code. To use Blackfire, you must first register on the site. Once registered, you will get a *server ID* and a *server token*. You pass these to the container, and it will fire up Blackfire automatically.

Example:	
```sh
docker run -it --rm --name heimap-server-container \
-e BLACKFIREIO_SERVER_ID="[your id here]" -e BLACKFIREIO_SERVER_TOKEN="[your token here]" \
-p 8080:80 -p 5434:5432 -p 8022:22 \
-v $PWD/drupal_src/modules/custom:/var/www/modules/custom \
-v $PWD/webapp:/var/www/webapp
-d  heimap-server-image
```

You can now start profiling your application.

Have fun!

