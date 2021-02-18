const core = require('@actions/core');
const wait = require('./wait');
const { Octokit } = require("@octokit/action");
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
const artifact = require('@actions/artifact');

fs = require('fs');
path = require('path');

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
const workspace=process.env.GITHUB_WORKSPACE;
core.info(workspace);
core.info(`Waiting ${workflowname} milliseconds3 ...`);

// get license
/*const { data } = await octokit.request("Get /repos/{owner}/ndepend2.github.io/contents/license", {
  headers: {
    accept: 'application/vnd.github.VERSION.raw',
  },
  owner
  
  
});*/
const  result  = await octokit.repos.getContent({
  owner: owner,
  repo: 'ndepend2.github.io',
  path: 'license',
  headers: {
    'Accept': 'application/vnd.github.v3.raw'
  }
})
// get branch name to use it in any request
var branch=process.env.GITHUB_HEAD_REF;

//get config
const { config } = await octokit.request("Get /repos/{owner}/{repo}/contents/license", {
  owner,
  repo
  
});

//get ndepend and extract it
const node12Path = await tc.downloadTool('https://www.codergears.com/protected/NDependTask.zip');
  const node12ExtractedFolder = await tc.extractZip(node12Path, _getTempDirectory()+'\\NDepend');
 const NDependParser=_getTempDirectory()+"\\NDepend\\NDependTask\\Integration\\VSTS\\VSTSAnalyzer.exe"
 const licenseFile=_getTempDirectory()+"\\NDepend\\NDependTask\\NDependProLicense.xml"
 const NDependOut=_getTempDirectory()+"\\NDependOut";
//add license file in ndepend install directory
fs.mkdirSync(NDependOut);
fs.writeFileSync(licenseFile, result.data);
const lic=fs.readFileSync(licenseFile);
core.info(lic);
await exec.exec(NDependParser, ['/outputDirectory', NDependOut,'/additionalOutput',workspace,'/sourceDirectory',workspace]);

const artifactClient = artifact.create()
const artifactName = 'ndepend';

var files=[];
const rootDirectory = NDependOut+"\\NDepend\\Issues";
fs.readdirSync(rootDirectory).forEach(file => {
  var fullPath = path.join(rootDirectory, file);
 files.push(fullPath);
});

const options = {
    continueOnError: true
}

const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
//get sln file
//get baseline build id
//get baseline ndar if exists from a specific build

//execute ndepend

// add artifacts


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
