const axios = require('axios');

const API_URL = 'http://localhost:4000/';
const TOTAL_REQUESTS = 200;

const sendRequests = async () => {
  let connectedCount = 0;

  console.log(`Sending ${TOTAL_REQUESTS} requests to ${API_URL}...\n`);

  const requests = Array.from({ length: TOTAL_REQUESTS }, (_, index) => {
    return axios
      .get(API_URL)
      .then(() => {
        connectedCount++;
        console.log(`Request ${index + 1}: Connected`);
      })
      .catch((error) => {
        console.log(`Request ${index + 1}: Not Connected (${error.message})`);
      });
  });

  await Promise.all(requests);

  console.log(`\nCompleted ${TOTAL_REQUESTS} requests.`);
  console.log(`Successfully Connected: ${connectedCount}`);
  console.log(`Failed: ${TOTAL_REQUESTS - connectedCount}`);
};

sendRequests();
