import * as core from '@actions/core';

import { isValidCondition, validateStatus } from './utils';
import { MSTeams } from './MSTeams';

async function run() {
	try {
		const status = validateStatus(
			core.getInput('type', { required: true }).toLowerCase()
		);
		const jobName = core.getInput('job_name', { required: true });
		const url = process.env.MSTEAMS_WEBHOOK || core.getInput('url');
		let mention = core.getInput('mention');
		let mentionCondition = core.getInput('mention_if').toLowerCase();
		const msteamsOptions = {
			username: core.getInput('username'),
			channel: core.getInput('channel'),
			icon_emoji: core.getInput('icon_emoji')
		};
		const commitFlag = core.getInput('commit') === 'true';
		const token = core.getInput('token');

		let job = core.getInput('job');
		job = job === '' ? {} : JSON.parse(job);
		console.log(job);
		let steps = core.getInput('steps');
		steps = steps === '' ? {} : JSON.parse(steps);
		console.log(steps);

		if (mention && !isValidCondition(mentionCondition)) {
			mention = '';
			mentionCondition = '';
			console.warn(`
      Ignore msteams message metion:
      mention_if: ${mentionCondition} is invalid
      `);
		}

		if (url === '') {
			throw new Error(`[Error] Missing MSTeams Incoming Webhooks URL.
      Please configure "MSTEAMS_WEBHOOK" as environment variable or
      specify the key called "url" in "with" section.
      `);
		}

		const msteams = new MSTeams();
		const payload = await msteams.generatePayload(
			jobName,
			status,
			mention,
			mentionCondition,
			commitFlag,
			token,
			{
				github,
				job,
				steps
			}
		);
		console.info(`Generated payload for msteams: ${JSON.stringify(payload)}`);

		await msteams.notify(url, msteamsOptions, payload);
		console.info('Sent message to MSTeams');
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
