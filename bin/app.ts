#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {OndemandContracts} from "@ondemandenv/odmd-contracts";
import {StackProps} from "aws-cdk-lib";
import {RepoBuildCtlVpc} from "../lib/repo-build-ctl-vpc";
import {
    ContractsEnverCdkDefaultVpc
} from "@ondemandenv/odmd-contracts/lib/repos/_default-vpc-rds/odmd-enver-default-vpc-rds";

const app = new cdk.App();


async function main() {

    const buildRegion = process.env.CDK_DEFAULT_REGION;
    const buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
    if (!buildRegion || !buildAccount) {
        throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
    }

    const props = {
        env: {
            account: buildAccount,
            region: buildRegion
        }
    } as StackProps;

    new OndemandContracts(app)

    const targetEnver = OndemandContracts.inst.getTargetEnver() as ContractsEnverCdkDefaultVpc

    new RepoBuildCtlVpc(app, targetEnver, props)
}


console.log("main begin.")
main().catch(e => {
    console.error(e)
    throw e
}).finally(() => {
    console.log("main end.")
})