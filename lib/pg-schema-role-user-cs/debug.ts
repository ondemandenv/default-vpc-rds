import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CreateSecretCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const evEnv = {
    "AWS_LAMBDA_FUNCTION_VERSION": "$LATEST",
    "adminSecretId": "fd0c165ef4609a757d8480a419a8bffe",
    "NODE_OPTIONS": "--unhandled-rejections=strict",
    "AWS_SESSION_TOKEN": "IQoJb3JpZ2luX2VjEKP//////////wEaCXVzLXdlc3QtMSJHMEUCIE1c92zwCnM+zqkGa0OCt2s/cnGyqA22FzQtw5JO5TabAiEA7JYgwxzkC6myAekxsIpZltTAyzoFDVudnTUqVeDB/C4q0wMIPBAAGgw0MjA4ODc0MTgzNzYiDN4JczWTBEPUHSCNRiqwAzboaLPO/ru7iFG+z79RTVMa4t0495ap7fp697wnYiTn4i4Q2pKx9CWDshn89NL53UrrYe0gAD/oSGMqXcxI7GWLduJC1FTWkWpDjDmefxD6bxC6xdpgl7PRtsHhp1V9Z75lHe+pnOtF5jRm0zG9M440jPCWyHzP6r64T2Hb6zXPKoL0omcwRQdroFLEXftMPa+iBrrjVODAGynwUSvcvuqHSekKrmttx5TPEhfv2/cBwc14iqhFTODJiWLeEiU54U5feAqniFu1Qo+i+bASlsCfA1z74qDYA7ABYYijNnPulhZgpCPdUqYww8lkmpi/zz0lA2UK3hXbpynw+DoaqpjcUJrmvqaBhkZyain7w0aDLhwTFhX/S9070xRJY2qCorHacT1+pYs1N4519xSNNnDMQotS2Dv65Dh8bxVeupQ7SbUMQmng71MmC+KzFy224kG0+h3u23gG8EGkfpPMiPhYuwDtOGo76Ahw+rDyE5XSJshxJcSlUDpCqDI+vCXSv1PNIZ35+DhlnsmBKgz0q3VrdPRYDsVGtCzcFhXpTgUPOxqp/b0j+rywEVogCU8tyTDz/c2sBjqeAQvvp7ZM4ekOqRu3B24ZQiuBUQ1s/XsCXptEUW+kqeWJbrLKut0zbfJX/ZE4qCkviHgxLbLC9+v4cPwtQcqvF5k41LBS8WgYeKV5x5v864NiGdETyLrucR6Sy7yqKuXSQnOga24TJbV45R8Q4zqktOjXGoZ7S96vTXuNI8sB6BqLnsOpf5ZnYUDEapv04o1Tlp6yD0dcgqSB6GMetyn3",
    "postgresHostname": "f381a4ae0260986cab729777b15d0012.cluster-cdeukiqki8dt.us-west-1.rds.amazonaws.com",
    "AWS_LAMBDA_LOG_GROUP_NAME": "/aws/lambda/gyang-ctl-BUILD-spring-rds-cdk-4208-usrfun5F2E3D05-Ucxht4goUB4J",
    "LAMBDA_TASK_ROOT": "/var/task",
    "LD_LIBRARY_PATH": "/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib",
    "AWS_LAMBDA_RUNTIME_API": "127.0.0.1:9001",
    "AWS_LAMBDA_LOG_STREAM_NAME": "2024/01/02/[$LATEST]7cb7df9088114862b11441d2f7f2f89e",
    "AWS_EXECUTION_ENV": "AWS_Lambda_nodejs18.x",
    "databaseName": "defaultDatabaseName",
    "AWS_LAMBDA_FUNCTION_NAME": "gyang-ctl-BUILD-spring-rds-cdk-4208-usrfun5F2E3D05-Ucxht4goUB4J",
    "AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129:2000",
    "PATH": "/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin",
    "AWS_DEFAULT_REGION": "us-west-1",
    "PWD": "/var/task",
    "AWS_SECRET_ACCESS_KEY": "l/ABH9W5sCTbq9eM4gMYAkGV1TWMESzQZ6sbg1tA",
    "LAMBDA_RUNTIME_DIR": "/var/runtime",
    "LANG": "en_US.UTF-8",
    "AWS_LAMBDA_INITIALIZATION_TYPE": "on-demand",
    "NODE_PATH": "/opt/nodejs/node18/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task",
    "postgresHostport": "5432",
    "AWS_REGION": "us-west-1",
    "TZ": ":UTC",
    "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    "AWS_ACCESS_KEY_ID": "ASIAWD7WYKYEFY5NIWFK",
    "SHLVL": "0",
    "_AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129",
    "_AWS_XRAY_DAEMON_PORT": "2000",
    "AWS_XRAY_CONTEXT_MISSING": "LOG_ERROR",
    "_HANDLER": "index.handler",
    "AWS_LAMBDA_FUNCTION_MEMORY_SIZE": "256",
    "NODE_EXTRA_CA_CERTS": "/var/runtime/ca-cert.pem",
    "_X_AMZN_TRACE_ID": "Root=1-65937ef1-36e47ec861b7809b59536238;Parent=27bb0f970d7fdd19;Sampled=0;Lineage=5673c35d:0|4339c38d:0"
} as { [k: string]: string }

for (const k in evEnv) {
    process.env[k] = evEnv[k]!
}


/*-------------------------------------------------------------*/

async function loadENVs() {
    // process.env.buildId = "odmd-contracts";
    // process.env.odmd_ghApp_ID = "377358";
    // process.env.odmd_ghApp_installationID = "41561130";
    // process.env.ghApp_key_secret_name = "github-app-377358-privatekey";
    process.env.postgresHostname = "127.0.0.1";

    const profile = '420887418376_AWSAdministratorAccess';


    const region = 'us-west-1'

    process.env.AWS_REGION = region
    process.env.AWS_DEFAULT_REGION = region

    process.env.AWS_ACCESS_KEY_ID = ''
    process.env.AWS_SECRET_ACCESS_KEY = ''
    process.env.AWS_SESSION_TOKEN = ''
}

async function main() {
    await loadENVs();

    const event = {
        "RequestType": "Delete",
        "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:gyang-ctl-BUILD-spring-rd-usrfunproviderframeworko-4U1UBpZHQo6u",
        "ResponseURL": "https://cloudformation-custom-resource-response-uswest1.s3-us-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-west-1%3A420887418376%3Astack/gyang-ctl-BUILD-spring-rds-cdk-420887418376-VPC-spring-rds-cdkOndemandenvspringrdscdkw2vpcName-RDS-f381a4ae0260986cab729777b/ca3b7750-a91b-11ee-8fde-06e3e8ab711d%7Cw2testspringrdsusrtestspringreadonlyuser54CF9160%7C0d6e952c-b00b-42d7-bf30-1739ef4c5d04?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240102T031151Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIA3MSIBDUEIAXP7Y6W%2F20240102%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=b8746f036020f415fa1258786005845173054fe1abe654d5b505a2e9da9342d5",
        "StackId": "arn:aws:cloudformation:us-west-1:420887418376:stack/gyang-ctl-BUILD-spring-rds-cdk-420887418376-VPC-spring-rds-cdkOndemandenvspringrdscdkw2vpcName-RDS-f381a4ae0260986cab729777b/ca3b7750-a91b-11ee-8fde-06e3e8ab711d",
        "RequestId": "0d6e952c-b00b-42d7-bf30-1739ef4c5d04",
        "LogicalResourceId": "w2testspringrdsusrtestspringreadonlyuser54CF9160",
        "ResourceType": "Custom::OdmdPgUser",
        "ResourceProperties": {
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:gyang-ctl-BUILD-spring-rd-usrfunproviderframeworko-4U1UBpZHQo6u",
            "roleType": "readonly",
            "userSecretId": "spring-rds-cdkOndemandenvspringrdscdkw2readonlyuser",
            "schemaName": "test_spring",
            "userName": "readonly_user"
        },
        PhysicalResourceId: 'N/A'
    } as CloudFormationCustomResourceEvent

    const context = {
        done(error?: Error, result?: any): void {
            console.error(error)
        }, fail(error: Error | string): void {
            console.error(error)
        }, getRemainingTimeInMillis(): number {
            return 0;
        }, succeed(message: any, object?: any): void {
            console.info(message)
        },
        "callbackWaitsForEmptyEventLoop": true,
        "functionVersion": "$LATEST",
        "functionName": "odmd-contracts-ghwf_as_pp_490548955090",
        "memoryLimitInMB": "128",
        "logGroupName": "/aws/lambda/odmd-contracts-ghwf_as_pp_490548955090",
        "logStreamName": "2023/09/17/[$LATEST]d0ea6212887e4209a5c75475f6ac86b5",
        "invokedFunctionArn": "arn:aws:lambda:us-west-2:835934552565:function:odmd-contracts-ghwf_as_pp_490548955090",
        "awsRequestId": "335d7c99-34e6-4bb2-ad81-134aecf5591c"
    };
    await (await import( './index' )).handler(event, context)
}


async function tmpTst() {
    await loadENVs();

    const cred = {username: 'gyang-tst', password: 'fake pass word 1234567890'};
    const sm = new SecretsManagerClient({})
    const created = await sm.send(new CreateSecretCommand({
        Name: undefined,
        SecretString: JSON.stringify(cred)
    }))

    console.log(created)
}

// tmpTst().catch(e => {
main().catch(e => {
    console.error("main error>>>")
    console.error(e)
    console.error("main error<<<")
    throw e
}).finally(() => {
    console.log("main end.")
})
//curl -sS -f -I -H "Authorization: token ghp_yourOwnToken" https://api.github.com | grep -i x-oauth-scopes x-oauth-scopes: public_repo, repo:status, repo_deployment
