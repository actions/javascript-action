const core = require("@actions/core");
const github = require("@actions/github");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const owner = core.getInput("owner", { required: true });
    const repo = core.getInput("repo", { required: true });
    const pr_number = core.getInput("pr_number", { required: true });
    const token = core.getInput("token", { required: true });

    const octokit = new github.getOctokit(token);

    const { data: changedFiles } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pr_number,
    });

    let diffData = {
      additions: 0,
      deletions: 0,
      changes: 0,
    };

    diffData = changedFiles.reduce((acc, file) => {
      acc.addition += file.additions;
      acc.deletions = file.deletions;
      acc.changes += file.changes;
    }, diffData);

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: `
        Pull request #${pr_number} has be updated with: \n
        - ${diffData.additions} additions \n
        - ${diffData.deletions} .deletions \n
        - ${diffData.changes} .changes\n
      `,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
