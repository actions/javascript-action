import * as github from '@actions/github';
import { getStatus } from './utils';
import { SectionBlock, MessageAttachment, MrkdwnElement } from '@slack/types';
import {
  IncomingWebhook, IncomingWebhookDefaultArguments,
  IncomingWebhookSendArguments, IncomingWebhookResult
} from '@slack/webhook';

const SLACK_WEBHOOK: string = process.env.SLACK_WEBHOOK || '';
if (SLACK_WEBHOOK === '') {
  throw new Error('ERROR: Missing "SLACK_WEBHOOK"\nPlease configure "SLACK_WEBHOOK" as environment variable');
}

export class Slack {
  client: IncomingWebhook;
  // index 0: failure 1: success
  protected color: string[] = ['#cb2431', '#2cbe4e'];
  // protected status_emoji: string[] = [':x:', ':white_check_mark:']

  constructor(
    icon_emoji: string,
    username: string,
    channel: string
  ) {
    const params: IncomingWebhookDefaultArguments = {
      username,
      icon_emoji,
      channel
    };

    this.client = new IncomingWebhook(SLACK_WEBHOOK, params);
  }

  /**
   * Get slack blocks UI
   */
  protected get blocks(): SectionBlock {
    const context = github.context;
    const { sha, eventName, workflow, ref } = context;
    const { owner, repo } = context.repo;
    const repo_url: string = `https://github.com/${owner}/${repo}`;
    const action_url: string = `${repo_url}/commit/${sha}/checks`;

    const blocks: SectionBlock = {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*repository*\n<${repo_url}|${owner}/${repo}>` },
        { type: 'mrkdwn', text: `*ref*\n${ref}` },
        { type: 'mrkdwn', text: `*eventName*\n${eventName}` },
        { type: 'mrkdwn', text: `*workflow*\n<${action_url}|${workflow}>` },
      ]
    }

    return blocks;
  }

  /**
   * Generate slack payload
   */
  protected generatePayload(status: number, text: MrkdwnElement): IncomingWebhookSendArguments {
    const blocks: SectionBlock = { ...this.blocks, text };
    const attachments: MessageAttachment = {
      color: this.color[status - 1],
      blocks: [blocks]
    }
    const payload: IncomingWebhookSendArguments = {
      attachments: [attachments]
    }

    console.log(`Genetate payload for slack: ${JSON.stringify(payload)}`);

    return payload;
  }

  /**
   * Notify information about github actions to Slack
   */
  public async notify(type: string, job_name: string): Promise<IncomingWebhookResult> {
    const status: number = getStatus(type);
    const slack_text: MrkdwnElement = { type: 'mrkdwn', text: job_name };
    let payload: IncomingWebhookSendArguments = this.generatePayload(status, slack_text);

    try {
      const result = await this.client.send(payload);
      console.log('Sent message to Slack');
      return result;
    } catch (err) {
      throw err;
    }
  }
}