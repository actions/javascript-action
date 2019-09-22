import * as core from '@actions/core';
import { Slack } from './slack';
import { Status, getStatus } from './utils';

async function run() {
  try {
    const status: Status = getStatus(core.getInput('type', { required: true }));
    const job_name: string = core.getInput('job_name', { required: true });
    const mention: string = core.getInput('mention');
    const mention_if: Status = getStatus(core.getInput('mention_if'));
    const username: string = core.getInput('username');
    const icon_emoji: string = core.getInput('icon_emoji');
    const channel: string = core.getInput('channel');
    const url: string = core.getInput('url') || process.env.SLACK_WEBHOOK || '';

    if (url === '') {
      throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
    }

    const slack = new Slack(url, username, icon_emoji, channel);
    const payload = slack.generatePayload(job_name, mention, mention_if, status);
    const result = await slack.notify(payload);

    core.debug(`Response from Slack: ${JSON.stringify(result)}`);

  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
