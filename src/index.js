const core = require('@actions/core');

const { MSTeams } = require('./MSTeams');

async function run() {
	try {
		const webhook_url = process.env.MSTEAMS_WEBHOOK || core.getInput('webhook_url');

		let job = core.getInput('job');
		job = job === '' ? {} : JSON.parse(job);
		let steps = core.getInput('steps');
		steps = steps === '' ? {} : JSON.parse(steps);
		let needs = core.getInput('needs');
		needs = needs === '' ? {} : JSON.parse(needs);
		let overwrite = core.getInput('overwrite');
		let raw = core.getInput('raw');
		let dry_run = core.getInput('dry_run');

		if (webhook_url === '') {
			throw new Error(`[Error] Missing MSTeams Incoming Webhooks URL.
      Please configure "MSTEAMS_WEBHOOK" as environment variable or
      specify the key called "webhook_url" in "with" section.
      `);
		}

		const msteams = new MSTeams();
		const payload = raw || await msteams.generatePayload(
			{
				job,
				steps,
				needs,
				overwrite
			}
		);
		core.info(`Generated payload for msteams: ${JSON.stringify(payload)}`);

		if(!dry_run) {
			await msteams.notify(webhook_url, payload);
			core.info('Sent message to MSTeams');
		}
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
