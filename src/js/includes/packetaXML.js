const request = require('request');
const {XMLParser} = require('fast-xml-parser');

const packetaXML = (data, xmlBody) => {
  return new Promise((resolve, reject) => {
    request.post({
      rejectUnauthorized: false,
      url: 'https://www.zasilkovna.cz/api/rest',
      method: 'POST',
      headers: {
          'Content-Type': 'application/xml',
      },
      body: xmlBody
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        reject('An error occurred during the communication');
      } else {
        const options = {
          ignoreAttributes : false
        };

        const parser = new XMLParser(options);
        let obj = parser.parse(body);
        if (obj.response.status == 'ok') {
          resolve('Success');
        } else {
          console.log(obj.response.detail.attributes);
          reject('Packeta rejected the request');
        }
      }
    }); 
  });
}

module.exports = packetaXML;
