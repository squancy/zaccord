<img align="right" width="60" src="https://www.zaccord.com/images/logo.png">
<h1>Zaccord</h1>
A webshop for selling 3D printed products.

Zaccord is a Hungary-based e-commerce website where users can order a variety of 3D-printed
products or upload their STL files for custom printing & creating lithophanes.<br>
We tried to create a great customer experience by simplifying the process of shopping & eliminating the need to ask for a bid when using our custom print service. This all makes shopping fun and instant.<br><br>

## Target audience
We aim to make Zaccord available for as many people as we can but currently we are limited
to Hungary. Therefore, only Hungarain citizens and people with a valid Hungarian address are
able to use the service and buy products since shipping is restricted to inland.<br>
Also note that Zaccord is currently only available in Hungarian.

## Technical
The site is written in vanilla Node.js & SQL (MySQL) for managing the database. It uses a handful of libraries for user authentication & security and managing STL files.

## Price calculation formula
It calculates the price of a given product when knowing the base price with the following
default paramaters:
  - 0.20mm layer height
  - 20% infill
  - x1 scale
  - 1.2mm infill thickness
where the pure value of these parameters are substituted into variables in degrees.
<img src="https://www.zaccord.com/images/finalFormula.png">
Eventually, it provides the desired price intervals for us. You can refine it to your needs by
changing the <i>sine</i> expressions and decimal constants.<br>
Note that due to the nature of the <i>sine</i> function 90% infill provides the highest
price and any infill value above that will produce a smaller price, returning an undesirable outcome at the end. You may need to correct it if you want to use a 91%-100% infill.

## TODOs
Implementing one or more of the following features would be nice & you may also get a reward:
  - A product review system with 1-5 stars & comments
  - View lithophanes in STL mode (see 3DRocks)
  - A clever algorithm for giving a close enough price estimate for custom printed products &
    lithophanes
  - Anything else you think would be cool...

## Source code
We made this project open source because we want to spread 3D-printed products especially in Hungary & inspire people for trying out new technologies.

## Distributing source code
If you found any bugs or want to contribute to the development of Zaccord as a developer feel free to do it in a pull request.
You can even use it as a reference for creating your project or getting ideas for 3D-printing websites.

## Contributing
If you want to contribute to the development of Zaccord feel free to do it. We are grateful for
anyone who contributes to the project.<br>
In addition, if you implement one or more of the TODOs listed above or significantly contribute
to this project we may send you a free 3D printed product of your choice and we also give you a
chance to join our team and work with us.

## Setting up the project
After cloning the repository & installing Node.js create the database by importing `database.sql` to MySQL.<br>
In `src/js/connectDb.js` configure the parameters for connecting to the database.<br>
To install the dependencies run `npm install`.<br>
To start the project run `node app.js` and the site should be up on port 5000.<br>
If you also want to make the e-mail sending service work you will need to edit the connection parameters to your server in `src/js/includes/sendEmail.js`.<br>
You may also want to edit the secret for sessions in `src/js/includes/createSession.js`.

## Contact
If you have any questions drop me with an e-mail at <a href="mailto:mark@pearscom.com">mark@pearscom.com</a>.
