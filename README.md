<img align="right" width="60" src="https://www.zaccord.com/images/logo.png">
<h1>Zaccord</h1>
A service for ordering STL files and lithophanes & a webshop for selling 3D printed products.

Zaccord is a Hungary-based e-commerce website where users can order a variety of 3D-printed
products or upload their STL files for custom printing & creating lithophanes.<br>
We tried to create a great customer experience by allowing users to upload their own STL files, give
them an instant quote and provide the possibility to order their uploaded products immediately.<br><br>

## Target audience
We aim to make Zaccord available for as many people as we can but currently we are limited
to Hungary. Therefore, only Hungarain citizens and people with a valid Hungarian address are
able to use the service and buy products since shipping is restricted to inland.<br>
Also note that Zaccord is currently only available in Hungarian.

## Technical
The site is mostly written in JS (Node.js on server side) and the 
<a href="https://github.com/squancy/stl-parser">price calculation algorithm</a> is implemented in C.
The price is solely determined by the uploaded STL file and no slicing or g-code generation occurs on the
server side. Despite that it makes the calculation less precise it also eliminates the need to create a
request to the server side and return it to the client, making the process faster and easier. 

## Price calculation & STL parsing
First an estimated price is calculated from the STL file which can change later
if the user modifies some of the parameters. The base price is determined by an
algorithm you can find
<a href="https://github.com/squancy/stl-parser">here.</a>

## TODOs
Implementing one or more of the following features would be nice & you may also get a reward:
  - Geometrically check if the uploaded STL file determines a closed object in space
  - Check if the STL file has a minimum wall thickness (necessarry for printing)
  - Check any other requirements for 3D printing
  - View lithophanes in STL mode (see 3DRocks)
  - A clever algorithm for giving a close enough price estimate for custom printed products &
    lithophanes
  - Anything else you think would be cool...

## Distributing source code
If you found any bugs or want to contribute to the development of Zaccord as a developer feel free to do it in a pull request.
You can even use it as a reference for creating your project or getting ideas for 3D-printing websites.

## Contributing
If you want to contribute to the development of Zaccord feel free to do it. We are grateful for
anyone who contributes to the project.<br>
In addition, if you implement one or more of the TODOs listed above or significantly contribute
to this project we may send you a free 3D printed product of your choice.

## Setting up the project
After cloning the repository & installing Node.js create the database by importing `database.sql` to MySQL.<br>
In `src/js/includes/connConstants.js` configure the parameters for connecting to the database.<br>
If you want to use all features you should configure `src/js/includes/constants.js` according
to your needs.<br>
The minimum you need to do to make it work is to change `SESSION_SECRET` in `src/js/includes/constants.js` to some random string.<br>
Note that Zaccord is only tested in Node v. 16 and it’s advisable to run it with this version. I’m planning to test it on newer versions of Node as well.
To install the   run `npm ci` to install the dependencies from `package-lock.json`.<br>
Optionally, you can download Slic3r as an executable & its libraries and place it under `Slic3r`. It’s ignored it the current version.<br>
To start the project run `node app.js` and the site should be up on port 5000.<br>

## Contact
If you have any questions drop me with an e-mail at <a href="mailto:mark@pearscom.com">mark@pearscom.com</a>.
