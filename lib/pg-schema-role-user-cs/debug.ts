import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CreateSecretCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const evEnv = {
    "AWS_LAMBDA_FUNCTION_VERSION": "$LATEST",
    "adminSecretId": "ondemandenvOdmdBuildDefaultVpcRdsspringcdkecssamplesecret",
    "NODE_OPTIONS": "--unhandled-rejections=strict",
    "AWS_SESSION_TOKEN": "IQoJb3JpZ2luX2VjEL7//////////wEaCXVzLXdlc3QtMSJHMEUCIHSBKWiEmQfdRYrcHnJc5N1GKKE8jNo3RjUg1xQjZ/LrAiEAvDEXbb/khnw9J/oseXwD5r4xa8Y5DZE4wikavslbKxAq0wMIFxAAGgw0MjA4ODc0MTgzNzYiDKqcg+SvLC72bDZG6SqwA8NjbkuhnAtkV5gN0sTbppbt2WplKElxTby0m6MG9ZZesJ8nOUzAslZDrxkB9u+wPYjvvAr6bgxrI+OFmgt/62Nnr/Ca6/MMDlF4x0B4DNoaP3f56m9W9yPBO+wpHXOZ44PaBP71zpyE77kq+O7m2kd6IXBn+Iv58SjD6eISCo+d5FKaJM1LkoUI4c+yi80ukH+VYvEppEEjB9sY+qJmzgdc2djQg8j6kz6yYUf1RsQnrX3VZi+lWeAVhK8Cf7EcfMgEy9fmFUPUKU3zD6D6lTun8U98gcyHc/qPyLr4IytgKoA1hO6+w4Wh/XRR6xUruzQigweuHN21SBq0DL9h1mbExd78pX9JLHfg/20fWNkdsITZN7/fAry6T0Y9XRUUKGdGuoi/yAyjUkEbDBU7b60omT3B9kWHnY7bNbjAvQDgfjWETyJtxoZp5Ap4iQhqkRWF2Wco52AzpoctnP5XL8q4SL/G0kAyxZ95vAK+FMlRWt/rVts0ZJQOc+hUoWMHuUhV+7fHCEfz8dvpe+H/jdMcv2XQgL4fIJEpTyRXtHS8ucO2fXKm4qFrtTIHI7Tc6jCHw76xBjqeAY2cX0UFpXUamucaBBEjwr62oWhhG0fxNBGkAwZWXBAfy85qrB8T6eM2ag2O9pCZs5j4pFs0n9eQvwWXi/ATuwQ99ZbgonRS5928P0quM3gXRSsCqHVHeqvCeP9/wsQQ9AURcEbwHUUHfWqpu9erpGD1x5rQYcR9NYuFeuoUReKLfMP/sJiCDXlYvcQdmMTLmmg3PPlLb/zX0BrAoaxn",
    "postgresHostname": "springcdkecs-rds-sample.cluster-cdeukiqki8dt.us-west-1.rds.amazonaws.com",
    "AWS_LAMBDA_LOG_GROUP_NAME": "/aws/lambda/OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-5GygVQ4EM9X0",
    "LAMBDA_TASK_ROOT": "/var/task",
    "LD_LIBRARY_PATH": "/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib",
    "AWS_LAMBDA_RUNTIME_API": "127.0.0.1:9001",
    "AWS_LAMBDA_LOG_STREAM_NAME": "2024/04/29/[$LATEST]e4591178df8e4a0b9d1130cc9a8fc11f",
    "AWS_EXECUTION_ENV": "AWS_Lambda_nodejs18.x",
    "databaseName": "defaultDatabaseName",
    "AWS_LAMBDA_FUNCTION_NAME": "OdmdBuildDefaultVpcRds-main-sprin-pgusrfun11BF7D8D-5GygVQ4EM9X0",
    "AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129:2000",
    "PATH": "/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin",
    "AWS_DEFAULT_REGION": "us-west-1",
    "PWD": "/var/task",
    "AWS_SECRET_ACCESS_KEY": "5+5XRoFVQrFZ950OXLn+XzU8TZXqf0bC9bzJL5Li",
    "LAMBDA_RUNTIME_DIR": "/var/runtime",
    "LANG": "en_US.UTF-8",
    "AWS_LAMBDA_INITIALIZATION_TYPE": "on-demand",
    "NODE_PATH": "/opt/nodejs/node18/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task",
    "postgresHostport": "5432",
    "AWS_REGION": "us-west-1",
    "TZ": ":UTC",
    "secretPath": "odmd-/OdmdBuildDefaultVpcRds/springcdkecs-rds-sample",
    "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    "AWS_ACCESS_KEY_ID": "ASIAWD7WYKYEGE7U6E7Y",
    "SHLVL": "0",
    "_AWS_XRAY_DAEMON_ADDRESS": "169.254.79.129",
    "_AWS_XRAY_DAEMON_PORT": "2000",
    "AWS_XRAY_CONTEXT_MISSING": "LOG_ERROR",
    "_HANDLER": "index.handler",
    "AWS_LAMBDA_FUNCTION_MEMORY_SIZE": "256",
    "NODE_EXTRA_CA_CERTS": "/var/runtime/ca-cert.pem",
    "_X_AMZN_TRACE_ID": "Root=1-662fa185-62637c731156ca5f7bc11810;Parent=54a5898828520799;Sampled=0;Lineage=7214a10b:0|9d64d3b4:0"
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

    const region = 'us-west-1'

    process.env.AWS_REGION = region
    process.env.AWS_DEFAULT_REGION = region


    process.env.AWS_ACCESS_KEY_ID = "ASIAWD7WYKYECCNMGDYJ"
    process.env.AWS_SECRET_ACCESS_KEY = "SdZExAQPp2zrrsfeHDVFWEpaKGxEGF2igNqZE1Ne"
    process.env.AWS_SESSION_TOKEN = "IQoJb3JpZ2luX2VjEL///////////wEaCXVzLXdlc3QtMiJHMEUCIQCT+gIKRHfMEIdT3QtGzo9YrIlriBWtdLWjC7Sa/H8zcwIgan51xkYwZlrtILEjd25GkBPZ5wy9nnpqVxCzdMBYm/0qjwMIGBAAGgw0MjA4ODc0MTgzNzYiDIIwO/roQvKBS34mjyrsAoqBcXX/hsrUJTkHQBcO5x1Oa7LIj4fplA9SNolnwkKlyXyR9x0bKq44bku0fCbBigRPCWsQUAPMuTbM+HCM9KeuQCgoX633LKE4/oSOkR4+GpWMc2TjbC9Ph8VB959bMGSEmg2bPyq1z1qEpqt/pwu9cVyNciNyblFZqr80gw7P04J1vxycVHc17CNa2pZ3LfRpAbd71skjW71h4oHIyi6EfnAOGx8m+kfPz/zi+e1B7wJqi6EFJ8a7iRb7bZmEL1KmqV/5O0etGL8okRvX0LYCY7ruN56slHJ4H7fU1tny7TfIto3V5Vg9s0ERAFENwMoInUuJAbMIShSqMniTiiB6fxIcBN/GSDV2iW3U0A7zoXUwr6lDFGpm6UeYuOU2c0l8q4HtJyOvwBwxjr/ngMWf/uuzKCz7+GigH8VqsCId9tf6QSc626QlRlUGmkULoY7yW9KMCU81g8reS2nMcqBTtDkwoWccsKz9qP0w4Oa+sQY6pgFmWedxwIAmJaKIQst4q7ny8AaMZ0zc86UnidxIliZ3ETx83yVb5oBjdiuMFyUx+X9PftjYa+bGzwFFoiaafJuJBlOUZNncXPqIzy3zlUoTyXrO1qFY9mi67Ze8vt82HokA2bYX9avoyRgK+ca6fmfCW9ccdAvJbkllWV7s0GvKQ0NJvl1nrWEXeUEV1K63FquSdOLMtOTOkXQCKSEYlIifnpvVpOyU"
}

async function main() {
    await loadENVs();

    const schemaInitEvent = {
        "RequestType": "Create",
        "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-XE9dB8E2h15I",
        "ResponseURL": "https://cloudformation-custom-resource-response-uswest1.s3-us-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aus-west-1%3A420887418376%3Astack/spring-rds-cdk--odmdSbxUsw1/80004380-032c-11ef-b1bc-06bf9934a2df%7Cschemacdkecsrdsusrcdkecsappusrodmdsbxusw13F4017FB%7C9dcde942-c169-4ff1-a1df-771110ea4ff3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240429T133253Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7199&X-Amz-Credential=AKIA3MSIBDUEKBINJKOD%2F20240429%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Signature=1f3f4aeba32c2412edca4060930268c1e25b4b927c9f111061ac0f31339e8e8f",
        "StackId": "arn:aws:cloudformation:us-west-1:420887418376:stack/spring-rds-cdk--odmdSbxUsw1/80004380-032c-11ef-b1bc-06bf9934a2df",
        "RequestId": "9dcde942-c169-4ff1-a1df-771110ea4ff3",
        "LogicalResourceId": "schemacdkecsrdsusrcdkecsappusrodmdsbxusw13F4017FB",
        "ResourceType": "Custom::OdmdPgUser",
        "ResourceProperties": {
            "ServiceToken": "arn:aws:lambda:us-west-1:420887418376:function:OdmdBuildDefaultVpcRds-ma-usrfunproviderframeworko-XE9dB8E2h15I",
            "schemaName": "cdkecs",
            "roleType": "app",
            "userName": "appusrodmdsbxusw1"
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
