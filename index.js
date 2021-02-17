const core = require('@actions/core');
const wait = require('./wait');
const { Octokit } = require("@octokit/action");
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
function _getTempDirectory() {
  const tempDirectory = process.env['RUNNER_TEMP'] ;
  return tempDirectory;
}

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

// get branch name to use it in any request
var branch=process.env.GITHUB_HEAD_REF;

//get config
const { config } = await octokit.request("Get /repos/{owner}/{repo}/contents/license", {
  owner,
  repo
  
});

//get ndepend and extract it
const node12Path = await tc.downloadTool('https://www.codergears.com/protected/NDependTask.zip');
  const node12ExtractedFolder = await tc.extractZip(node12Path, 'NDepend');
 const NDependParser=_getTempDirectory()+"\NDepend\NDependTask\Integration\VSTS\VSTSAnalyzer.exe"
  await exec.exec(NDependParser, ['index.js', 'foo=bar']);
//add license file in ndepend install directory

//get sln file
//get baseline build id
//get baseline ndar if exists from a specific build

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
