# Slatify

![](https://github.com/homoluctus/slatify/workflows/TS%20Lint%20Check/badge.svg)
![](https://github.com/homoluctus/slatify/workflows/Works%20properly/badge.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/homoluctus/slatify?color=brightgreen)
![GitHub](https://img.shields.io/github/license/homoluctus/slatify?color=brightgreen)

This is Slack Notification for GitHub Actions.<br>
Generated from [actions/javascript-template](https://github.com/actions/javascript-template).

# Feature
- Notify the result of GitHub Actions
- Support three job status (reference: [job-context](https://help.github.com/en/articles/contexts-and-expression-syntax-for-github-actions#job-context))
  - success
  - failure
  - cancelled
- Mention
  - Notify message to channel members efficiently
  - You can specify the condition to mention

# How to use
First of all, you need to set GitHub secrets for SLACK_WEBHOOK that is Incoming Webhook URL.<br>
You can customize the following parameters:

|with parameter|required/optional|default|description|
|:--:|:--:|:--|:--|
|type|required|N/A|The result of GitHub Actions job<br>This parameter value must contain the following word:<br>- `success`<br>- `fail`<br>- `cancel`<br>We recommend using ${{ job.status }}|
|job_name|required|N/A|Means slack notification title|
|url|required|N/A|Slack Incoming Webhooks URL<br>Please specify this key or SLACK_WEBHOOK environment variable<br>※SLACK_WEBHOOK will be deprecated|
|mention|optional|N/A|Slack message mention|
|mention_if|optional|N/A|The condition to mention<br>This parameter can contain the following word:<br>- `success`<br>- `failure`<br>- `cancelled`<br>- `always`|
|icon_emoji|optional|Use Slack Incoming Webhook configuration|Slack icon|
|username|optional|Use Slack Incoming Webhook configuration|Slack username|
|channel|optional|Use Slack Incoming Webhook configuration|Slack channel name|

Please refer `action.yml` for more details.

## Example
```..github/workflows/main.yml
- name: Slack Notification
  uses: homoluctus/slatify@master
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Lint Check*'
    channel: '#random'
    url: ${{ secrets.SLACK_WEBHOOK }}
```

# Slack UI Example

<img src="./images/slack.png" alt="Notification Preview" width="70%">

## Preview

<img src="./images/preview.png" alt="Notification Preview" width="70%">

# Contribute
1. Fork this repository
2. Pull your repository in local machine
3. Update original repository
4. Checkout "develop" branch based "remotes/origin/develop" branch
5. Work on "develop" branch
6. Push you changes to your repository
7. Create a new Pull Request

# LICENSE

[The MIT License (MIT)](https://github.com/homoluctus/slatify/blob/master/LICENSE)