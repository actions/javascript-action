import * as core from '@actions/core';
import {IncomingWebhookDefaultArguments} from '@slack/webhook';

import {validateStatus, isValidCondition} from './utils';
import {Slack} from './slack';

async function run() {
  try {
    const status: string = validateStatus(
      core.getInput('type', {required: true}).toLowerCase()
    );
    const jobName: string = core.getInput('job_name', {required: true});
    const url: string = process.env.SLACK_WEBHOOK || core.getInput('url');
    let mention: string = core.getInput('mention');
    let mentionCondition: string = core.getInput('mention_if').toLowerCase();
    const slackOptions: IncomingWebhookDefaultArguments = {
      username: core.getInput('username'),
      channel: core.getInput('channel'),
      icon_emoji: core.getInput('icon_emoji')
    };
    const commitFlag: boolean = core.getInput('commit') === 'true';
    const token: string = core.getInput('token');

    if (mention && !isValidCondition(mentionCondition)) {
      mention = '';
      mentionCondition = '';
      console.warn(`
      Ignore slack message metion:
      mention_if: ${mentionCondition} is invalid
      `);
    }

    if (url === '') {
      throw new Error(`[Error] Missing Slack Incoming Webhooks URL.
      Please configure "SLACK_WEBHOOK" as environment variable or
      specify the key called "url" in "with" section.
      `);
    }

    const slack = new Slack();
    const payload = await slack.generatePayload(
      jobName,
      status,
      mention,
      mentionCondition,
      commitFlag,
      token
    );
    console.info(`Generated payload for slack: ${JSON.stringify(payload)}`);

    await slack.notify(url, slackOptions, payload);
    console.info('Sent message to Slack');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
