// ! This file used to experement with the code!

const getParams = async (firstUrl, secondUrl) => {
  const theUrl =
    md_client_using.moodle_url +
    firstUrl +
    md_client_using.moodle_token +
    secondUrl;
  // GET request
  await axios
    .get(theUrl)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      return error;
    });
};
