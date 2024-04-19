import {App, Stack, Tags} from 'aws-cdk-lib'
import {
    CfnRoute,
    CfnRouteTable,
    CfnTransitGatewayAttachment,
    IpAddresses,
    SelectedSubnets,
    SubnetType,
    Vpc,
    VpcProps
} from "aws-cdk-lib/aws-ec2";
import {RepoBuildCtlVpcRdsStack} from "./repo-build-ctl-vpc-rds-stack";
import * as odmd from "@ondemandenv/odmd-contracts";
import {
    ContractsEnverCdkDefaultVpcRds
} from "@ondemandenv/odmd-contracts/lib/repos/_default-vpc-rds/odmd-build-default-vpc-rds";


export class RepoBuildCtlVpcStack extends Stack {

    public readonly vpc: Vpc
    public readonly privateSubnets: SelectedSubnets;
    public readonly vpcRdsStack: RepoBuildCtlVpcRdsStack;

    constructor(parent: App, ctlId: string, m: ContractsEnverCdkDefaultVpcRds) {
        super(parent, `${ctlId}-VPC-${m.vpcConfig.vpcName.replace(/[^a-zA-Z0-9]/g, '-')}`);

        if (m.owner.buildId == odmd.OndemandContracts.inst.networking.buildId) {
            throw new Error(`No vpc should be shared in ${odmd.OndemandContracts.inst.networking.buildId}`)
        }

        const nwShares = [m.vpcConfig.ipAddresses.ipv4IpamPoolRef.producer]

        const tgwRef = m.vpcConfig.transitGatewayRef
        if (tgwRef) {
            nwShares.push(tgwRef.producer)
        }

        const shareIn = new odmd.ContractsShareIn(this, m.owner.buildId,
            nwShares)

        const vpcProps = {
            vpcName: m.vpcConfig.vpcName,
            maxAzs: m.vpcConfig.maxAzs,
            natGateways: m.vpcConfig.natGateways,
            ipAddresses: IpAddresses.awsIpamAllocation({
                ipv4IpamPoolId: shareIn.getShareValue(m.vpcConfig.ipAddresses.ipv4IpamPoolRef.producer) as string,
                ipv4NetmaskLength: m.vpcConfig.ipAddresses.ipv4NetmaskLength,
                defaultSubnetIpv4NetmaskLength: m.vpcConfig.ipAddresses.defaultSubnetIpv4NetmaskLength
            })
        } as VpcProps;

        this.vpc = new Vpc(this, this.stackName + '_vpc_' + m.vpcConfig.vpcName, vpcProps)

        new Set(this.vpc.privateSubnets.concat(this.vpc.publicSubnets).concat(this.vpc.isolatedSubnets)).forEach(sbn => {
            Tags.of(sbn).add('Name', odmd.OdmdNames.create(sbn, '', 255), {
                priority: 100
            })
            sbn.node.children.filter(c => c instanceof CfnRouteTable).forEach(rt => {
                Tags.of(rt).add('Name', odmd.OdmdNames.create(rt, '', 255), {
                    priority: 100
                })
            })
        })

        try {
            this.privateSubnets = this.vpc.selectSubnets({subnetType: SubnetType.PRIVATE_WITH_EGRESS});
        } catch (e) {
            console.warn((e as Error).message)
            this.privateSubnets = this.vpc.selectSubnets({subnetType: SubnetType.PRIVATE_ISOLATED});
        }

        new odmd.ContractsShareOut(this, new Map<odmd.ContractsCrossRefProducer<odmd.AnyContractsEnVer>, string | number>([
            [m.vpcConfig.ipAddresses.ipv4Cidr, this.vpc.vpcCidrBlock]
        ]))

        if (tgwRef) {
            if (this.privateSubnets.subnets.length == 0) {
                throw new Error("privateSubnets.subnets.length == 0")
            }

            const tgwAttach = new CfnTransitGatewayAttachment(this, 'tgwAttach', {
                vpcId: this.vpc.vpcId, subnetIds: this.privateSubnets.subnetIds,
                transitGatewayId: shareIn.getShareValue(tgwRef.producer) as string
            })
            this.privateSubnets.subnets.forEach((s, i) => {
                const r = new CfnRoute(this, `tgw-${i}`, {
                    routeTableId: s.routeTable.routeTableId,
                    destinationCidrBlock: '0.0.0.0/0',
                    transitGatewayId: tgwAttach.transitGatewayId
                })
                r.addDependency(tgwAttach)
            })
        } else {
            console.warn(`No TGW ~~~~ for build:${m.owner.buildId}, vpc:${vpcProps.vpcName}`)
        }
        if( m.rdsConfig ){
            this.vpcRdsStack = new RepoBuildCtlVpcRdsStack(parent, this, m)
        }

    }
}
