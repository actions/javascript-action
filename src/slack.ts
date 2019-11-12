import * as github from '@actions/github';
import * as core from '@actions/core';
import { isAllowedStatus } from './utils';
import { SectionBlock, MessageAttachment } from '@slack/types';
import {
  IncomingWebhook, IncomingWebhookSendArguments,
  IncomingWebhookResult
} from '@slack/webhook';

interface AccessoryDesign {
  color: string;
  result: string;
}

interface Accessory {
  failure: AccessoryDesign;
  success: AccessoryDesign;
  cancelled: AccessoryDesign;
}

class Slack extends IncomingWebhook {
  static readonly accessory: Accessory = {
    failure: {
      color: '#cb2431',
      result: 'Failed'
    },
    success: {
      color: '#2cbe4e',
      result: 'Succeeded'
    },
    cancelled: {
      color: '#ffc107',
      result: 'Cancelled'
    }
  };

  constructor(
    url: string,
    username: string,
    iconEmoji: string,
    channel: string
  ) {
    super(url, {username, icon_emoji: iconEmoji, channel});
  }

  /**
   * Get slack blocks UI
   * @returns {SectionBlock} blocks
   */
  protected get blocks(): SectionBlock {
    const context = github.context;
    const { sha, eventName, workflow, ref } = context;
    const { owner, repo } = context.repo;
    const { number } = context.issue;
    const repoUrl: string = `https://github.com/${owner}/${repo}`;
    let actionUrl: string = repoUrl;

    if (eventName === 'pull_request') {
      actionUrl += `/pull/${number}/checks`
    } else {
      actionUrl += `/commit/${sha}/checks`;
    }

    const blocks: SectionBlock = {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*repository*\n<${repoUrl}|${owner}/${repo}>` },
        { type: 'mrkdwn', text: `*ref*\n${ref}` },
        { type: 'mrkdwn', text: `*event name*\n${eventName}` },
        { type: 'mrkdwn', text: `*workflow*\n<${actionUrl}|${workflow}>` },
      ]
    }

    return blocks;
  }

  /**
   * Check if message mention is needed
   * @param {string} mentionCondition - mention condition
   * @param {string} status - job status
   * @returns {boolean}
   */
  protected isMention(mentionCondition: string, status: string): boolean {
    if (mentionCondition === 'always' || mentionCondition === status) {
      return true;
    }
    return false;
  }

  /**
   * Generate slack payload
   * @param {string} jobName
   * @param {string} mention
   * @param {string} mentionCondition
   * @param {string} status
   * @returns {IncomingWebhookSendArguments} payload
   */
  public generatePayload(
    jobName: string,
    mention: string,
    mentionCondition: string,
    status: string
  ): IncomingWebhookSendArguments {

    if (status === 'always') {
      throw new Error('"always" cannot be specified with "type" parameter')
    }

    const color: string = Slack.accessory[status]['color'];
    const result: string = Slack.accessory[status]['result'];
    const mentionText: string = this.isMention(mentionCondition, status) ? mention : '';
    let text: string = `${jobName} ${result}`;

    if (mentionText !== '') {
      text = `<!${mentionText}> ${text}`;
    }

    const attachments: MessageAttachment = {
      color,
      blocks: [this.blocks]
    }

    const payload: IncomingWebhookSendArguments = {
      text,
      attachments: [attachments],
      unfurl_links: true
    }

    core.debug(`Generated payload for slack: ${JSON.stringify(payload)}`);

    return payload;
  }

  /**
   * Notify information about github actions to Slack
   * @param {IncomingWebhookSendArguments} payload
   * @returns {Promise<IncomingWebhookResult>} result
   */
  public async notify(payload: IncomingWebhookSendArguments): Promise<IncomingWebhookResult> {
    try {
      const result = await this.send(payload);
      core.debug('Sent message to Slack');
      return result;
    } catch (err) {
      throw err;
    }
  }
}

export async function run() {
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
