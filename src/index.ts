import * as core from '@actions/core';
import { Slack } from './slack';
import { isAllowedStatus } from './utils';

async function run() {
  try {
    const status: string = isAllowedStatus(core.getInput('type', { required: true }));
    const jobName: string = core.getInput('job_name', { required: true });
    const mention: string = core.getInput('mention');
    const mentionCondition: string = core.getInput('mention_if');
    const username: string = core.getInput('username');
    const iconEmoji: string = core.getInput('icon_emoji');
    const channel: string = core.getInput('channel');
    const url: string = core.getInput('url') || process.env.SLACK_WEBHOOK || '';

    if (url === '') {
      throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
    }

    const slack = new Slack(url, username, iconEmoji, channel);
    const payload = slack.generatePayload(jobName, mention, mentionCondition, status);
    const result = await slack.notify(payload);

    core.debug(`Response from Slack: ${JSON.stringify(result)}`);

  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
