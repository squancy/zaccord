// Generate a form for delivery information from db
function genDelivery(conn, userID) {
  return new Promise((resolve, reject) => {
    let dQuery = `
      SELECT * FROM delivery_data WHERE uid = ? LIMIT 1
    `;
    conn.query(dQuery, [userID], (err, result, field) => {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek proóbáld újra');
        return;
      }

      if (result.length < 0) {
        reject('Nincs ilyen felhasználó');
        return;
      }

      // If there is value in db use that as value; otherwise nothing
      let name = !result[0]['name'] ? '' : result[0]['name'];
      let postalCode = !result[0]['postal_code'] ? '' : result[0]['postal_code'];
      let city = !result[0]['city'] ? '' : result[0]['city'];
      let address = !result[0]['address'] ? '' : result[0]['address'];
      let mobile = !result[0]['mobile'] ? '' : result[0]['mobile'];

      let output = `
        <div class="flexDiv" style="flex-wrap: wrap;">
          <input type="text" class="dFormField" id="name" placeholder="Név"
            value="${name}">
          <input type="text" class="dFormField" id="pcode" placeholder="Irányítószám"
            value="${postalCode}">
          <input type="text" class="dFormField" id="city" placeholder="Város"
            value="${city}">
          <input type="text" class="dFormField" id="address" placeholder="Cím"
            value="${address}">
          <input type="text" class="dFormField" id="mobile" placeholder="Telefonszám"
            value="${mobile}">
        </div>
      `
      resolve(output);
    });
  });
}

module.exports = genDelivery;
