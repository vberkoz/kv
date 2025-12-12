import { Stack, StackProps, RemovalPolicy, SecretValue, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

interface AuthStackProps extends StackProps {
  baseDomain: string;
}

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'KVUserPool', {
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      userPoolName: 'KVUserPool',
    });

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
    }

    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'KVGoogleProvider', {
      userPool: this.userPool,
      clientId: googleClientId,
      clientSecretValue: SecretValue.unsafePlainText(googleClientSecret),
      scopes: ['profile', 'email', 'openid'],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
      },
    });

    const authDomain = `auth.kv.${props.baseDomain}`;
    const dashboardUrl = `https://dashboard.kv.${props.baseDomain}`;
    
    this.userPoolClient = this.userPool.addClient('KVAppClient', {
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [`${dashboardUrl}/auth-callback`, 'http://localhost:5173/auth-callback'],
        logoutUrls: [`${dashboardUrl}/login`, 'http://localhost:5173/login'],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      preventUserExistenceErrors: true,
    });

    this.userPoolClient.node.addDependency(googleProvider);

    const hostedZone = route53.HostedZone.fromLookup(this, 'KVHostedZone', {
      domainName: props.baseDomain,
    });

    const cognitoCert = new acm.Certificate(this, 'KVCognitoCert', {
      domainName: authDomain,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.userPoolDomain = this.userPool.addDomain('KVUserPoolDomain', {
      customDomain: {
        domainName: authDomain,
        certificate: cognitoCert,
      },
    });

    const cognitoAliasRecord = new route53.ARecord(this, 'KVCognitoAliasRecord', {
      zone: hostedZone,
      recordName: authDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.UserPoolDomainTarget(this.userPoolDomain)
      ),
    });

    cognitoAliasRecord.node.addDependency(this.userPoolDomain);

    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new CfnOutput(this, 'CognitoDomain', {
      value: `https://${authDomain}`,
      description: 'Cognito Custom Domain',
    });
  }
}
