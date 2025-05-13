# Generating Animation from Images

## Introduction

The project explores the domain of animating the child's drawings by auto capturing motion joint points and giving the user a set of auto generated animations. 

## Setting up the project on local device

To set up the frontend and backend, a Linux or macOS is recommended. On Windows, you may encounter issues related to allocating sufficient RAM to the model running inside Docker. While it is possible to run the project on Windows by manually adjusting Docker's memory settings, successful execution is not guaranteed.

### Setting up the backend
Virtual Environment Setup

    # create and activate the virtual environment
    conda create --name animated_drawings python=3.8.13
    conda activate animated_drawings

    # clone AnimatedDrawings and use pip to install
    git clone https://github.com/facebookresearch/AnimatedDrawings.git
    cd AnimatedDrawings
    pip install -e .


#### Docker Setup

To set up the container, follow these steps:

Install Docker Desktop
Ensure Docker Desktop is running.
Run the following commands, starting from the Animated Drawings root directory:
    (animated_drawings) AnimatedDrawings % cd torchserve

    # build the docker image... this takes a while (~5-7 minutes on Macbook Pro 2021)
    (animated_drawings) torchserve % docker build -t docker_torchserve .

    # start the docker container and expose the necessary ports
    (animated_drawings) torchserve % docker run -d --name docker_torchserve -p 8080:8080 -p 8081:8081 docker_torchserve
Wait ~10 seconds, then ensure Docker and TorchServe are working by pinging the server:


Note : if you run into any issues kindly follow this directory : https://github.com/facebookresearch/AnimatedDrawings

setup mongodb compass and mongodb commands terminal as this project utilises authorization so that mutliple user can connect to a single backend 

After setting up these , clone this repositery and open both backend and frontend folder and run the following commands

    npm install
    
And all set! Project installation is done!

On your mobile device, install expo go app it will act as a host for our current frontend. 

## How to run

    # run this on frontend terminal 
    npm run start 

    # run this on backend terminal 
    npm run dev

Scan the qr code from the frontend and create your own user profile by clicking the signup option then you can explore the camera on the tab icon from there start animating different animation with no time.
