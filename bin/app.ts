#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {RepoBuildCtlVpcStack} from "../lib/repo-build-ctl-vpc-stack";
import {OndemandContracts} from "@ondemandenv/odmd-contracts";
import {StackProps} from "aws-cdk-lib";

async function main() {
    const app = new cdk.App();

    new OndemandContracts(app)

    const buildRegion = process.env.CDK_DEFAULT_REGION;
    const buildAccount = process.env.CDK_DEFAULT_ACCOUNT
        ? process.env.CDK_DEFAULT_ACCOUNT
        : process.env.CODEBUILD_BUILD_ARN!.split(":")[4];
    if (!buildRegion || !buildAccount) {
        throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
    }

    const props = {
        env: {
            account: buildAccount,
            region: buildRegion
        }
    } as StackProps;


    const vpc = new RepoBuildCtlVpcStack(
        app, 'a1234', OndemandContracts.inst.defaultVpcRds.envers[0])

}


console.log("main begin.")
main().catch(e => {
    console.error(e)
    throw e
}).finally(() => {
    console.log("main end.")
})

