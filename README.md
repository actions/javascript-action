# Slatify

![](https://github.com/homoluctus/slatify/workflows/TS%20Lint%20Check/badge.svg)
![](https://github.com/homoluctus/slatify/workflows/Actions%20works%20properly/badge.svg)
![](https://github.com/homoluctus/slatify/workflows/Prepare%20for%20release/badge.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/homoluctus/slatify?color=brightgreen)
![GitHub](https://img.shields.io/github/license/homoluctus/slatify?color=brightgreen)

This is Slack Notification for GitHub Actions.<br>
Generated from [actions/javascript-template](https://github.com/actions/javascript-template).

# Feature
- Notify the result of GitHub Actions

# How to use
First of all, you need to set GitHub secrets for SLACK_WEBHOOK that is Incoming Webhook URL.<br>
You can customize the following parameters:

|with parameter|required/optional|default|description|
|:--:|:--:|:--|:--|
|type|required|N/A|The result of GitHub Actions job<br>This parameter value must contain `success`, `fail` or `cancel`<br>We recommend using ${{ job.status }}|
|job_name|required|N/A|Means slack notification title|
|icon_emoji|optional|github|Slack icon|
|username|optional|Github Actions|Slack username|
|channel|optional|Use Slack Incoming Webhook configuration|Slack channel name|
|url|optional|N/A|Slack Incoming Webhooks URL<br>Please specify this key or SLACK_WEBHOOK environment variable<br>※SLACK_WEBHOOK will be deprecated|

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
## Success Case

<img src="./images/github_actions_success.png" alt="github actions success pattern">

## Failure Case

<img src="./images/github_actions_failure.png" alt="github actions failure pattern">

## Cancel Case

<img src="./images/github_actions_cancel.png" alt="github actions cancel pattern">

## Preview

<img src="./images/preview.png" alt="Notification Preview">

# LICENSE

[The MIT License (MIT)](https://github.com/homoluctus/slatify/blob/master/LICENSE)