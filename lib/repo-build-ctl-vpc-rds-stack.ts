import {Port, SecurityGroup, SelectedSubnets, SubnetType} from "aws-cdk-lib/aws-ec2";
import {RepoBuildCtlVpcStack} from "./repo-build-ctl-vpc-stack";
import {AuroraPostgresEngineVersion, Credentials, DatabaseClusterEngine, ServerlessCluster} from "aws-cdk-lib/aws-rds";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";
import {App, CfnOutput, Duration, Stack} from "aws-cdk-lib";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Provider} from "aws-cdk-lib/custom-resources";
import * as odmd from "@ondemandenv/odmd-contracts";
import {ContractsRdsCluster} from "@ondemandenv/odmd-contracts";
import {
    ContractsEnverCdkDefaultVpcRds
} from "@ondemandenv/odmd-contracts/lib/repos/_default-vpc-rds/odmd-build-default-vpc-rds";


export class RepoBuildCtlVpcRdsStack extends Stack{

    private readonly vpcStack: RepoBuildCtlVpcStack
    private readonly schUsrFun: NodejsFunction
    private readonly rdsCluster: ServerlessCluster;

    constructor(parent: App, vpcStack: RepoBuildCtlVpcStack, m: ContractsEnverCdkDefaultVpcRds) {
        const rds = m.rdsConfig!
        super(parent, vpcStack.stackName + '-RDS-' + rds.clusterIdentifier);
        this.vpcStack = vpcStack;

        const pid = `odmd-${m.owner.buildId}-${rds.vpc.vpcName}`
        let rdsSubnets: SelectedSubnets;
        try {
            rdsSubnets = this.vpcStack.vpc.selectSubnets({subnetType: SubnetType.PRIVATE_WITH_EGRESS});
        } catch (e) {
            rdsSubnets = vpcStack.vpc.selectSubnets({subnetType: SubnetType.PRIVATE_ISOLATED});
            if (rdsSubnets.subnets.length == 0) {
                throw new Error("No private subnets available for rds?")
            }
        }

        const rdsClusterSg = new SecurityGroup(this, rds.defaultSgName, {
            securityGroupName: rds.defaultSgName,
            vpc: vpcStack.vpc,
        });
        this.rdsCluster = new ServerlessCluster(this, rds.clusterIdentifier, {
            clusterIdentifier: rds.clusterIdentifier,
            engine: DatabaseClusterEngine.auroraPostgres({version: AuroraPostgresEngineVersion.VER_13_12}),
            vpc: vpcStack.vpc,
            scaling: rds.scaling,
            defaultDatabaseName: rds.defaultDatabaseName,
            securityGroups: [rdsClusterSg],
            vpcSubnets: rdsSubnets,
            credentials: Credentials.fromGeneratedSecret(rds.rootUsername, {secretName: rds.rootSecretName}),
        })

        const exportPgUsrProviderName = odmd.GET_PG_USR_ROLE_PROVIDER_NAME(m.owner.buildId, process.env.CDK_DEFAULT_REGION!,
            m.targetAWSAccountID, rds.vpc.vpcName)

        const usrFuncSg = new SecurityGroup(this, 'usr-fun-sg', {
            vpc: vpcStack.vpc,
            securityGroupName: pid + '-pg-schm-usr-fun-sg'
        });
        /*
                        adminSecretId: rds.credsSecret.secretName,
                        postgresHostname: rdsCluster.clusterEndpoint.hostname,
                        postgresHostport: rdsCluster.clusterEndpoint.port,
                        databaseName: rds.defaultDatabaseName,*/
        const secretPath = 'odmd-/' + m.owner.buildId + '/' + rds.clusterIdentifier;
        this.schUsrFun = new NodejsFunction(this, 'pg-usr-fun', {
            memorySize: 256,
            vpcSubnets: vpcStack.privateSubnets,
            vpc: vpcStack.vpc,
            securityGroups: [usrFuncSg],
            bundling: {
                externalModules: [
                    '@aws-sdk/client-secrets-manager'
                ],
            },
            environment: {
                NODE_OPTIONS: '--unhandled-rejections=strict',
                adminSecretId: rds.rootSecretName,
                postgresHostname: this.rdsCluster.clusterEndpoint.hostname,
                postgresHostport: this.rdsCluster.clusterEndpoint.port.toString(),
                databaseName: rds.defaultDatabaseName,
                secretPath
            },
            runtime: Runtime.NODEJS_18_X,
            entry: path.join(__dirname, `pg-schema-role-user-cs/index.ts`),
            timeout: Duration.minutes(3),
            logRetention: RetentionDays.ONE_MONTH
        });
        rdsClusterSg.addIngressRule(usrFuncSg, Port.tcp(this.rdsCluster.clusterEndpoint.port))
        this.rdsCluster.secret!.grantRead(this.schUsrFun)
        const createUsrPolicy = new Policy(this, 'create-user-secret', {
            statements: [
                new PolicyStatement({
                    actions: ['secretsmanager:*'],
                    resources: [`arn:aws:secretsmanager:${this.vpcStack.region}:${this.vpcStack.account}:secret:${secretPath}*`]
                })
            ]
        });
        this.schUsrFun.role!.attachInlinePolicy(createUsrPolicy)
        this.schUsrFun.node.addDependency(rdsClusterSg)
        const provider = new Provider(this, `usr-fun-provider`, {onEventHandler: this.schUsrFun});
        provider.node.addDependency(this.rdsCluster, createUsrPolicy)

        new CfnOutput(this, exportPgUsrProviderName, {
            exportName: exportPgUsrProviderName,
            value: provider.serviceToken
        })


        const map = new Map<odmd.ContractsCrossRefProducer<odmd.AnyContractsEnVer>, string | number>([
            [rds.clusterHostname, this.rdsCluster.clusterEndpoint.hostname],
            [rds.clusterPort, this.rdsCluster.clusterEndpoint.port],
            [rds.clusterSocketAddress, this.rdsCluster.clusterEndpoint.socketAddress],
        ])

        const pgUsrs = new odmd.PgSchemaUsers(this, rds.schemaRoleUsers!, true, provider.serviceToken)

        rds.schemaRoleUsers!.userSecrets.forEach((us: odmd.PgUsr) => {
            map.set(rds.usernameToSecretId.get(us.userName)!, pgUsrs.usernameToSecretId.get(us.userName)!)
        })

        new odmd.ContractsShareOut(this, new Map<odmd.ContractsCrossRefProducer<odmd.AnyContractsEnVer>, string | number>(map))
    }

}

