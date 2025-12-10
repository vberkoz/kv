import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Dashboard, GraphWidget, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

interface MonitoringStackProps extends StackProps {
  api: RestApi;
  getValue: NodejsFunction;
  putValue: NodejsFunction;
  deleteValue: NodejsFunction;
}

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const alarmTopic = new Topic(this, 'AlarmTopic', {
      displayName: 'KV Storage Alarms'
    });

    if (process.env.ALARM_EMAIL) {
      alarmTopic.addSubscription(new EmailSubscription(process.env.ALARM_EMAIL));
    }

    const dashboard = new Dashboard(this, 'KVDashboard', {
      dashboardName: 'KV-Storage-Metrics'
    });

    dashboard.addWidgets(
      new GraphWidget({
        title: 'API Requests',
        left: [props.api.metricCount()],
        width: 12
      }),
      new GraphWidget({
        title: 'API Latency',
        left: [props.api.metricLatency()],
        width: 12
      })
    );

    dashboard.addWidgets(
      new GraphWidget({
        title: 'Lambda Duration - GET',
        left: [props.getValue.metricDuration()],
        width: 8
      }),
      new GraphWidget({
        title: 'Lambda Duration - PUT',
        left: [props.putValue.metricDuration()],
        width: 8
      }),
      new GraphWidget({
        title: 'Lambda Duration - DELETE',
        left: [props.deleteValue.metricDuration()],
        width: 8
      })
    );

    dashboard.addWidgets(
      new GraphWidget({
        title: 'Lambda Errors',
        left: [
          props.getValue.metricErrors(),
          props.putValue.metricErrors(),
          props.deleteValue.metricErrors()
        ],
        width: 12
      }),
      new GraphWidget({
        title: 'Lambda Invocations',
        left: [
          props.getValue.metricInvocations(),
          props.putValue.metricInvocations(),
          props.deleteValue.metricInvocations()
        ],
        width: 12
      })
    );

    new Alarm(this, 'ApiErrorAlarm', {
      metric: props.api.metricServerError(),
      threshold: 10,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: 'API 5xx errors exceeded threshold'
    }).addAlarmAction(new SnsAction(alarmTopic));

    new Alarm(this, 'ApiLatencyAlarm', {
      metric: props.api.metricLatency(),
      threshold: 1000,
      evaluationPeriods: 2,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: 'API latency exceeded 1 second'
    }).addAlarmAction(new SnsAction(alarmTopic));

    new Alarm(this, 'LambdaErrorAlarm', {
      metric: props.getValue.metricErrors(),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Lambda errors exceeded threshold'
    }).addAlarmAction(new SnsAction(alarmTopic));
  }
}
