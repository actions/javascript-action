const core = require('@actions/core');
const wait = require('./wait');
const octokit = new Octokit();

// most @actions toolkit packages have async methods
async function run() {
  try {
    const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// See https://developer.github.com/v3/issues/#create-an-issue
const { data } = await octokit.request("Get /repos/{owner}/{repo}/contents/license", {
  owner,
  repo
  
});
core.info(`content: ${data.content}`);
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds2 ...`);

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await wait(parseInt(ms));
    core.info((new Date()).toTimeString());
    var tempDirectory = process.env['RUNNER_TEMP'] ;
    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
