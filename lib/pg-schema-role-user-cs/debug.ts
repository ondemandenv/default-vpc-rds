import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CreateSecretCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const evEnv = {
    "AWS_LAMBDA_FUNCTION_VERSION": "$LATEST",
    "adminSecretId": "ondemandenvOdmdBuildDefaultVpcRdsspringcdkecssamplesecret",
    "NODE_OPTIONS": "--unhandled-rejections=strict",
    "AWS_SESSION_TOKEN": "IQoJb3JpZ2luX2VjEHwaCXVzLXdlc3QtMSJIMEYCIQDOEM4SNmy1PZAvMc1yGirSEYhPgHbqSNK9eqKigCagXQIhAIt8E8YvRHjB3WomQjQ5PJgb6gnNfXCiqyTyYjObtBS0KtwDCMX//////////wEQABoMNDIwODg3NDE4Mzc2IgxoqPveRdKelGoG+6UqsAP8atZjrhuIHy9/7K6fPvwAwuJyBTpJFxgDplqAlIXytjAyuLve1lNfEtMztNrVEVj2M0mIpgviQ172DxgJScULyAXNk9kaVBMYucJ7GmqU6COGY+21WSG4LzeNN3TMn3K0D2pOxKwVAksHr20pSyW1BGMxFCztWF4TuA+8LUrkqHs+YWKVPcCVqWRNiPic/2DxxTft9PHMV2Wrxlfgw1zIDUWVxlmc6qx+lj06LcHM+Nby3ee2sJmKwzR1eBKs6CYidLvaVgYKzrTIhFkGsQtafG0vY1Of2JIL1AmEGi9aCwt7mIGQXm1HM1h5q6nZjKppkDRzufyNwPdmjhMMMcWFDIBnHeoT5xmKPS38k3Fidl12egb64V8KfrWSgnh8/nNW9qNv8xctNHNwu0NV8Lm82550AbJ8ZqeOIbq90SqLRCilJVFivoGyGQ/EZF84iCD/81EUAbTERMK/WfIkgtSXvPc+IWHrFKr1jxS7z2pT4584Ufieo8VSh6uC1LoC97xn1nUi2LPsd0jE/SxFcTjECklbPRTFV+6A08lncxIjDvThiQctAwVnPupsbEOoK+owk4ewsQY6nQGRsUUJyGgDeV9q2qKWjsehvQW3bXdemkjdKdEF1o4pKu0uXCG1MqJt3fn4GXr7zDjMOvvNVXE7cDheyCi/iaAfk1MkAOWABjw3KaNOB0mkh+eUCms97G7apr1JSqxIvNDvaYXenQwJ4Ftu0aqH89QMxmSxKczUDJ+wOksz77arB5OlI1v3lQiGZKiNXFCpefZD8E+ABLD7VVtm7HaQ",
    "postgresHostname": "springcdkecs-rds-sample.cluster-cdeukiqki8dt.us-west-1.rds.amazonaws.com",
    "LAMBDA_TASK_ROOT": "/var/task",
    "AWS_LAMBDA_LOG_GROUP_NAME": "/aws/lambda/OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-jVz03i3sj60y",
    "LD_LIBRARY_PATH": "/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib",
    "AWS_LAMBDA_LOG_STREAM_NAME": "2024/04/26/[$LATEST]7842afa586534c489b4616bbcb7a64b8",
    "AWS_LAMBDA_RUNTIME_API": "127.0.0.1:9001",
    "AWS_EXECUTION_ENV": "AWS_Lambda_nodejs18.x",
    "databaseName": "defaultDatabaseName",
    "AWS_LAMBDA_FUNCTION_NAME": "OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-jVz03i3sj60y",
    "AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129:2000",
    "PATH": "/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin",
    "AWS_DEFAULT_REGION": "us-west-1",
    "PWD": "/var/task",
    "AWS_SECRET_ACCESS_KEY": "m1KUyQawasqt+42+sSX3b3syS1lTJhwAFQ+wGcE9",
    "LANG": "en_US.UTF-8",
    "LAMBDA_RUNTIME_DIR": "/var/runtime",
    "AWS_LAMBDA_INITIALIZATION_TYPE": "on-demand",
    "NODE_PATH": "/opt/nodejs/node18/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task",
    "postgresHostport": "5432",
    "TZ": ":UTC",
    "AWS_REGION": "us-west-1",
    "secretPath": "odmd-/OdmdBuildDefaultVpcRds/springcdkecs-rds-sample",
    "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    "AWS_ACCESS_KEY_ID": "ASIAWD7WYKYECDYOFY4U",
    "SHLVL": "0",
    "_AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129",
    "_AWS_XRAY_DAEMON_PORT": "2000",
    "AWS_XRAY_CONTEXT_MISSING": "LOG_ERROR",
    "_HANDLER": "index.handler",
    "AWS_LAMBDA_FUNCTION_MEMORY_SIZE": "256",
    "NODE_EXTRA_CA_CERTS": "/var/runtime/ca-cert.pem",
    "_X_AMZN_TRACE_ID": "Root=1-662c0391-484a5e8a71f59bc87b80be1b;Parent=29c3a68503918dfd;Sampled=0;Lineage=00c8d4df:0|30c3462a:0"
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

    const schemaInitEvent = {
        "RequestType": "Create",
        "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-Ynn8OVsKDO4h",
        "ResponseURL": "https://cloudformation-custom-resource-response-uswest1.s3-us-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-west-1%3A420887418376%3Astack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/0caaea50-0405-11ef-be65-02aa6bff63b1%7CschemacdkecsrdsusrcdkecsA09FBAFD%7C327662e4-a38d-4893-a043-730f7d51b71e?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240426T194209Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIA3MSIBDUEKBINJKOD%2F20240426%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=87c94431f33b43e828fc711c909931816701443660a666b498447e387dbc3087",
        "StackId": "arn:aws:cloudformation:us-west-1:420887418376:stack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/0caaea50-0405-11ef-be65-02aa6bff63b1",
        "RequestId": "327662e4-a38d-4893-a043-730f7d51b71e",
        "LogicalResourceId": "schemacdkecsrdsusrcdkecsA09FBAFD",
        "ResourceType": "Custom::OdmdPgSchRole",
        "ResourceProperties": {
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-Ynn8OVsKDO4h",
            "rds": "springcdkecs-rds-sample",
            "schemaName": "cdkecs"
        }
    } as CloudFormationCustomResourceEvent

    const createUser = {
        "RequestType": "Create",
        "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-Ynn8OVsKDO4h",
        "ResponseURL": "https://cloudformation-custom-resource-response-uswest1.s3-us-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-west-1%3A420887418376%3Astack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/0caaea50-0405-11ef-be65-02aa6bff63b1%7CschemacdkecsrdsusrcdkecscdkecsreadonlyCBBA1422%7Cb0475ea5-bc98-4f72-a36c-fbb4abc8b5fd?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240426T194214Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIA3MSIBDUEKBINJKOD%2F20240426%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=1058b60a13cf5072cdbd4ed877572c13c4daca3f21f243952ad037ca028edaaa",
        "StackId": "arn:aws:cloudformation:us-west-1:420887418376:stack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/0caaea50-0405-11ef-be65-02aa6bff63b1",
        "RequestId": "b0475ea5-bc98-4f72-a36c-fbb4abc8b5fd",
        "LogicalResourceId": "schemacdkecsrdsusrcdkecscdkecsreadonlyCBBA1422",
        "ResourceType": "Custom::OdmdPgUser",
        "ResourceProperties": {
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-Ynn8OVsKDO4h",
            "rds": "springcdkecs-rds-sample",
            "roleName": "readonly",
            "schemaName": "cdkecs",
            "userName": "cdkecs_readonly"
        }
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
    await (await import( './index' )).handler(schemaInitEvent, context)
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
