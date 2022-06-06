const constants = require('./constants.js');
const PACKETA_API_PASSWORD = constants.packetaAPIPassword;

// Return the XML body of the request for the communication between the server and Packeta
function getXMLPacketa(data, type) {
  switch (type) {
    case 'createPacket':
      return `
        <createPacket>
          <apiPassword>${PACKETA_API_PASSWORD}</apiPassword>
          <packetAttributes>
            <number>${data.number}</number>
            <name>${data.name}</name>
            <surname>${data.surname}</surname>
            <email>${data.email}</email>
            <currency>${data.currency}</currency>
            <value>${data.value}</value>
            <weight>${data.weight}</weight>
            <addressId>${data.addressId}</addressId>
            <phone>${data.phone}</phone>
            ${data.hasOwnProperty('cod') ? `<cod>${data.cod}</cod>` : ''}
            ${data.hasOwnProperty('street') ? `<street>${data.street}</street>` : ''}
            ${data.hasOwnProperty('zip') ? `<zip>${data.zip}</zip>` : ''}
            ${data.hasOwnProperty('city') ? `<city>${data.city}</city>` : ''}
            ${data.hasOwnProperty('houseNumber') ? `<houseNumber>${data.houseNumber}</houseNumber>` : ''}
          </packetAttributes>
        </createPacket>
      `; 
  }
}

module.exports = getXMLPacketa;
