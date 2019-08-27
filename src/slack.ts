import * as github from '@actions/github';
import * as core from '@actions/core';
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
  readonly color: string[] = ['danger', 'good'];

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
    const { sha, eventName, workflow, ref, action } = github.context;
    const { owner, repo } = github.context.repo;

    const blocks: SectionBlock = {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*repo*\n${repo}` },
        { type: 'mrkdwn', text: `*sha*\n${sha}` },
        { type: 'mrkdwn', text: `*eventName*\n${eventName}` },
        { type: 'mrkdwn', text: `*workflow*\n${workflow}` },
        { type: 'mrkdwn', text: `*ref*\n${ref}` },
        { type: 'mrkdwn', text: `*action*\n${action}` },
        { type: 'mrkdwn', text: `*owner*\n${owner}` }
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
      color: this.color[status],
      blocks: [blocks]
    }
    const payload: IncomingWebhookSendArguments = {
      attachments: [attachments]
    }

    core.debug(`payload: ${JSON.stringify(payload)}}`);

    return payload;
  }

  /**
   * Notify information about github actions to Slack
   */
  public async notify(status: number, message: string): Promise<IncomingWebhookResult> {
    const slack_text: MrkdwnElement = { type: 'mrkdwn', text: message };
    let payload: IncomingWebhookSendArguments = this.generatePayload(status, slack_text);

    try {
      const result = await this.client.send(payload);
      core.debug('Sent message to Slack');
      return result;
    } catch (err) {
      throw err;
    }
  }
}