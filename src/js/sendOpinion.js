const sendOpinion = (conn, opinion) => {
  return new Promise((resolve, reject) => {
    // Push user-submitted opinion to db
    // First make sure the message is below 1001 characters & is not empty
    if (opinion.replace(/(\r|\s)/g, '').length < 1) {
      reject('Üres a véleményed');
      return;
    } else if (opinion.replace(/(\r|\s)/g, '').length > 1000) {
      reject('A véleményed túllépte az 1,000 karaktert');
      return;
    } else {
      let iQuery = 'INSERT INTO feedback (opinion, date) VALUES (?, ?)';
      let commonDate = new Date().toMysqlFormat();
      conn.query(iQuery, [opinion, commonDate], (e, res, f) => {
        if (e) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        resolve('success')
      });
    }
  });
};

module.exports = sendOpinion;
