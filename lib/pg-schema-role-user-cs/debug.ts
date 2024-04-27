import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CreateSecretCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const evEnv = {
    "AWS_LAMBDA_FUNCTION_VERSION": "$LATEST",
    "adminSecretId": "ondemandenvOdmdBuildDefaultVpcRdsspringcdkecssamplesecret",
    "NODE_OPTIONS": "--unhandled-rejections=strict",
    "AWS_SESSION_TOKEN": "IQoJb3JpZ2luX2VjEIL//////////wEaCXVzLXdlc3QtMSJGMEQCIGH/VbtSohF3vpSqXwDeanb/iZarkqjt1JDCdaZh+ZHSAiA/ikGR7PsTL6n+n/W8HwGF8rYwtoY87bpsxqaHGDnSVSrcAwjL//////////8BEAAaDDQyMDg4NzQxODM3NiIMK6Pq9dc0cj7ZEpf8KrADeY7qdRH66CLbvgQxI2dpqaVm5r91hhVSFJOb+MLsscmiE7IpJm4uxzQPuIQsKK+7QNvcy/N1hgkXuuYYeJZslKmx6WCndLIbJxIDKesaKFM9wfgmE5npyC0S8WdG4Qm3RqmZGqHFn8dUNDPnFiEl8WAiXvBvfKk+tsHxEMHtcENZv+s7y4zXVW0KdeK2DaDxZDjvPHxorRjaXXqpEuyBxeg1lyEr+TF4lRGHnYbJQv5pZ+J1rVaMHmg+Eyqw0B5Hn4AqwUB2lmSwWQ5kmbeFoSTScRfIf4o0LcBy7rHEeqIxiStg7Zog+vcITkm7JU7D7P1wpxJfM8j5rOVm8uS6kF03gMrCzgm7ZMtCQw1s7i8h8S9u/+kWoB3QQ9LF1YV/59poWOx4ioguLyEKAMsSVX+/0VrxkgNhu2hPTPGs2monn5ZHXHAc4VEsGqo2xNCa3oJDepFcG5X5o43r/gqBxM02TekbbgdrcEpQjeHiEKhxQK75S8ZsSoOmhWdLW4/5eDTGqiUAg+x+ckFvS2YY0qc8nh3qthn48sYVyVZKCEx/0JS7ftedi6u/VIMzMkEwMKq8sbEGOp8B4LP59gnYy5ZkiAjBNt40ma0gA1XS0Ie62ZmxmpfR620lU0WK5sb+LmuT8iZuu/LnwoNFb9VmoU2M2IMIf8glF8PMdodKZzPtpnyEwUxpD7wQhVj+O6JV5KlRSqfgm+lj3RFGXP4tw/+kqK41+PB531k6NmfRiiz/dOWsbVPG+sWUVfXRqirg6sD9bPs5kPOf+55SufUaprtQ+ZzSmig/",
    "postgresHostname": "springcdkecs-rds-sample.cluster-cdeukiqki8dt.us-west-1.rds.amazonaws.com",
    "LAMBDA_TASK_ROOT": "/var/task",
    "AWS_LAMBDA_LOG_GROUP_NAME": "/aws/lambda/OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-5GygVQ4EM9X0",
    "LD_LIBRARY_PATH": "/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib",
    "AWS_LAMBDA_RUNTIME_API": "127.0.0.1:9001",
    "AWS_LAMBDA_LOG_STREAM_NAME": "2024/04/27/[$LATEST]9856b5152de64d899aa9a977c6e0fb9a",
    "AWS_EXECUTION_ENV": "AWS_Lambda_nodejs18.x",
    "databaseName": "defaultDatabaseName",
    "AWS_LAMBDA_FUNCTION_NAME": "OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-5GygVQ4EM9X0",
    "AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129:2000",
    "PATH": "/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin",
    "AWS_DEFAULT_REGION": "us-west-1",
    "PWD": "/var/task",
    "AWS_SECRET_ACCESS_KEY": "2JvVKADsY6pUSEfSXD8Xln5A0muV1i4cMEc/eD3l",
    "LANG": "en_US.UTF-8",
    "LAMBDA_RUNTIME_DIR": "/var/runtime",
    "AWS_LAMBDA_INITIALIZATION_TYPE": "on-demand",
    "NODE_PATH": "/opt/nodejs/node18/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task",
    "TZ": ":UTC",
    "AWS_REGION": "us-west-1",
    "postgresHostport": "5432",
    "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    "secretPath": "odmd-/OdmdBuildDefaultVpcRds/springcdkecs-rds-sample",
    "AWS_ACCESS_KEY_ID": "ASIAWD7WYKYEBRR2XQG3",
    "SHLVL": "0",
    "_AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129",
    "_AWS_XRAY_DAEMON_PORT": "2000",
    "AWS_XRAY_CONTEXT_MISSING": "LOG_ERROR",
    "_HANDLER": "index.handler",
    "AWS_LAMBDA_FUNCTION_MEMORY_SIZE": "256",
    "NODE_EXTRA_CA_CERTS": "/var/runtime/ca-cert.pem",
    "_X_AMZN_TRACE_ID": "Root=1-662c5e29-7d1b8ff21b08b5d21d9175e9;Parent=4c24b2e67ffffde9;Sampled=0;Lineage=7214a10b:0|9d64d3b4:0"
}as { [k: string]: string }

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

    const region = 'us-west-1'

    process.env.AWS_REGION = region
    process.env.AWS_DEFAULT_REGION = region

    process.env.AWS_ACCESS_KEY_ID = "ASIAWD7WYKYEIA2446V6"
    process.env.AWS_SECRET_ACCESS_KEY = "YXPuptn+OXJuKOST1HzkR6nZnH2cxPz/w+u56CMZ"
    process.env.AWS_SESSION_TOKEN = "IQoJb3JpZ2luX2VjEIP//////////wEaCXVzLXdlc3QtMiJIMEYCIQC2Ug6jfer/Cfsw96XtNpi1M/oWrWf67oewBhUIjt3e7AIhAIbDH1fd9uKsCieCQIbwG8hcQMyp7iOU14Z8tJQ7cQJqKpgDCMz//////////wEQABoMNDIwODg3NDE4Mzc2Igxwbkq07PJ+93xItr4q7AJjx+fLz+fm2bOCeac9CsWogaVMFLsKQrv/olrPysBgDg/W0XtgoXipZPkPc14oQ9AS5uUbEN1MIB1q7tKGEZWeSbdMpxC442UpH0azTiN5XcRV23juQl2MA3l7doPbo32S5c7vru3cdWultRtPkhg4Y0gvUUUuPBkGYaTzvFN8zUB/CZ5nEoKChmh/yRVlsFFto9001lPOhsnWE6dDKZ/UfqabUOqrtGtt4apQGaqyG0hOzBfICMtJrFxnxiN9rjQlBmvA+i/wLT1YTxd5+T8MLxNpXWb9dDDxvJX2FBYqvFjQrT1Wfe6AW0yK9O4IbHjYiJPVbEwRzwz0wRLjKzHRg0mtSj0Wrr+6RDlxPi18/qbiouY9uN2h6/7QmvMwqS5Igz+6whyNcgfODG6ZrolPj4c/VqjZzczS2Z98mXSni/ixwOsqJyeZ7/fX09wXhHTvgNMptMuY0urZT51nK6+FTBsuSCxQc1p2F5HgMITZsbEGOqUB1mTiqQNSoEhxm8UyB4wvVI/PmVt5AB8E4BaZhbpAs1lnkrxcIGmm7Ht14Wz9u5/3Ju3F17UTA/tWt09jC/BPk5PyclPECC2PP0Pv8z7wh+S6YT+k4EM/pGzQU5dYi6S6GOhpES0k5NMEki7cz2ZurlInITkPajrxoWD1QfBUPK20QwAGLPGBdhdsM7RwOakTW7dSQSJIUG0dvms1N07bGSDpQ8Z0"
}

async function main() {
    await loadENVs();

    const schemaInitEvent = {
        "RequestType": "Create",
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-XE9dB8E2h15I",
            "ResponseURL": "https://cloudformation-custom-resource-response-uswest1.s3-us-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-west-1%3A420887418376%3Astack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/f7c383c0-0438-11ef-b7e9-0284331dc49d%7CschemacdkecsrdsusrcdkecsA09FBAFD%7C50930cc2-a3e6-440e-8650-88adee9ea250?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240427T020841Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIA3MSIBDUEKBINJKOD%2F20240427%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=0ef00efd0144d3e7c88cb0de59913788def12f18f3ecd5dac6a65236c33c64fd",
            "StackId": "arn:aws:cloudformation:us-west-1:420887418376:stack/OdmdBuildDefaultVpcRds--main-springcdkecs-springcdkecs-rds-sample-cdkecs/f7c383c0-0438-11ef-b7e9-0284331dc49d",
            "RequestId": "50930cc2-a3e6-440e-8650-88adee9ea250",
            "LogicalResourceId": "schemacdkecsrdsusrcdkecsA09FBAFD",
            "ResourceType": "Custom::OdmdPgSchRole",
            "ResourceProperties": {
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-XE9dB8E2h15I",
                "schemaName": "cdkecs"
        }
    }as CloudFormationCustomResourceEvent

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
