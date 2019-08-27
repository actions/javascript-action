import * as core from '@actions/core';
import { Slack } from './slack';

async function run() {
  try {
    const type: string = core.getInput('type', { required: true });
    const job_name: string = core.getInput('job_name', { required: true });
    const channel: string = core.getInput('channel') || '#general';
    const icon_emoji: string = core.getInput('icon_emoji') || 'github';
    const username: string = core.getInput('username') || 'Github Actions';

    const slack = new Slack(icon_emoji, username, channel);
    const result = await slack.notify(type, job_name);

    console.log(`Response from Slack: ${JSON.stringify(result)}`);

  } catch (err) {
    console.log(err);
    core.setFailed(err);
  }
}

run();
