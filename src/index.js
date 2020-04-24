const core = require('@actions/core');
const MSTeams = require('./MSTeams');

const missing_functionality_warning = objective =>
	core.warning(`Missing ${objective} parameter will result in reduced functionality.`) || {};

const access_context = context_name => {
	let context = core.getInput(context_name);
	if (!context) missing_functionality_warning(context_name);
	return context === '' ? {} : JSON.parse(context);
};

async function run() {
	try {
		const webhook_url = process.env.MSTEAMS_WEBHOOK || core.getInput('webhook_url');

		let job = access_context('job');
		let steps = access_context('steps');
		let needs = access_context('needs');
		let overwrite = core.getInput('overwrite');
		let raw = core.getInput('raw');
		let dry_run = core.getInput('dry_run');

		if (webhook_url === '') {
			throw new Error(
				'[Error] Missing Microsoft Teams Incoming Webhooks URL.\n' +
				'Please configure "MSTEAMS_WEBHOOK" as environment variable or\n' +
				'specify the key called "webhook_url" in "with" section.'
			);
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
		core.info(`Generated payload for Microsoft Teams:\n${JSON.stringify(payload, null, 2)}`);

		if (!dry_run) {
			await msteams.notify(webhook_url, payload);
			core.info('Sent message to Microsoft Teams');
		}
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
