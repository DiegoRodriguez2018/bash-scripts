// Retrieves all public repos in user account and clones them.

const axios = require("axios");
const exec = require("child_process").exec;
const config = require('./config') // secrets

const username = config && config.github;

const url = `https://api.github.com/users/${username}/repos`;

const clone = async url => {
  console.log(`cloning: ${url}`);

  await exec(`git clone ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.log("SKIPPED", stderr);
      return;
    }
    console.log(stdout);
  });
};

axios.get(url).then(async res => {
  if (!res.data) {
    console.log("no data");
    return;
  }

  const ssh_urls = res.data.map(repo => repo.ssh_url);

  for (let i = 0; i < ssh_urls.length; i++) {
      const url = ssh_urls[i];
      await clone(url)
  }
});
