import * as core from '@actions/core';
import { Slack } from './slack';
import { Status, getStatus } from './utils';

async function run() {
  try {
    const type: string = core.getInput('type', { required: true });
    const job_name: string = core.getInput('job_name', { required: true });
    const username: string = core.getInput('username') || 'Github Actions';
    const icon_emoji: string = core.getInput('icon_emoji') || 'github';
    const channel: string = core.getInput('channel') || '#general';
    const url: string = core.getInput('url') || process.env.SLACK_WEBHOOK || '';

    if (url === '') {
      throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
    }

    const status: Status = getStatus(type);
    const slack = new Slack(url, username, icon_emoji, channel);
    const result = await slack.notify(status, job_name);

    core.debug(`Response from Slack: ${JSON.stringify(result)}`);

  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
