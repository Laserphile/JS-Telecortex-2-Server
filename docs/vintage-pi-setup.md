## Install on Raspbian from scratch
Follow [this guide](https://styxit.com/2017/03/14/headless-raspberry-setup.html) for instructions to setup up headless ssh over wifi.

### Enable all 4 SPI ports on raspberry pi
(this can be done by editing the file on the SD card, or while the pi is on)
As root, add the lines
```
dtparam=spi=on
dtoverlay=spi1-2cs
```
to `/boot/config.txt` and reboot.
For more options (e.g. 5 SPI devices) and pinouts see `/boot/overlays/README`.

To test, `ls /dev | grep spidev` should show
```
spidev0.0
spidev0.1
spidev1.0
spidev1.1
```

### Housekeeping
```bash
# Fresh pi needs update
sudo apt-get update && sudo apt-get upgrade
# Install vim
sudo apt-get install vim
# Install git
sudo apt-get install git
# Install zip
sudo apt-get install zip
# fix locale
sudo vim /etc/locale.gen
# uncomment the line corresponding to your locale, e.g. en_AU.UTF-8
sudo locale-gen en_AU.UTF-8
sudo update-locale en_AU.UTF-8
# If you have multiple servers, set your hostname to something unique
sudo vim /etc/hostname
```
### Install Node / Yarn

#### 1. Install build tools
```
sudo apt-get install gcc g++ make cmake libopencv-dev
```
#### 2. Install Node
Determine architecture
```
uname -m
```
*If you have an Armv7 or later Pi: (Model 2B, 3\*)*

If you just run `sudo apt-get install nodejs` you will get an old version of node. We want version 11.
```
# install node 11
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
```
*If you have an Armv6 Pi: (Model A, B, Zero)*
May not be possible to install a version of node later than 8 which is required

#### 3. Install yarn
If you just run `sudo apt-get install yarn` you will install [the wrong yarn](http://manpages.ubuntu.com/manpages/xenial/man1/yarn.1.html).
```
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
#### 4. Clone this repo
```
mkdir -p Documents/GitHub
git clone https://github.com/Laserphile/JS-Telecortex-2 Documents/GitHub/JS-Telecortex-2
cd ~/Documents/GitHub/JS-Telecortex-2
```

#### 5. Install JS dependencies

Install the opencv4nodejs npm package manually. This will take a long time.
```bash
npm install --force --save opencv4nodejs@4.14.0
```
Install JS dependencies
In order to stop opencv from re-building every time you change your yarn packages, you must add OPENCV4NODEJS_DISABLE_AUTOBUILD=1 to your environment.
```
OPENCV4NODEJS_DISABLE_AUTOBUILD=1 yarn install
```
