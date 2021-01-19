const core = require('@actions/core');
const wait = require('./wait');
const { Octokit } = require("@octokit/action");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const workflowname=process.env.GITHUB_WORKFLOW;
core.info(`Waiting ${workflowname} milliseconds3 ...`);
// get license
const { data } = await octokit.request("Get /repos/{owner}/{repo}/contents/license", {
  owner,
  repo
  
});
//get config


//get ndepend and extract it

//create license file

//get sln file

//get baseline ndar if exists

//execute ndepend

// add artifacts
core.info(`content: ${data.content}`);
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds3 ...`);

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
