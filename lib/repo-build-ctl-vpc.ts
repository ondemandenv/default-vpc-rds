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
import {RepoBuildCtlVpcRds} from "./repo-build-ctl-vpc-rds";
import {
    ContractsEnverCdkDefaultVpc
} from "@ondemandenv/odmd-contracts/lib/repos/_default-vpc-rds/odmd-enver-default-vpc-rds";
import {
    AnyContractsEnVer,
    ContractsCrossRefProducer,
    ContractsShareIn,
    ContractsShareOut,
    OdmdNames,
    OndemandContracts
} from "@ondemandenv/odmd-contracts";


export class RepoBuildCtlVpc extends Stack {

    public readonly vpc: Vpc
    public readonly privateSubnets: SelectedSubnets;

    constructor(parent: App, ctlId: string, m: ContractsEnverCdkDefaultVpc) {
        super(parent, `${ctlId}-VPC-${m.vpcConfig.vpcName.replace(/[^a-zA-Z0-9]/g, '-')}`);

        if (m.owner.buildId == OndemandContracts.inst.networking.buildId) {
            throw new Error(`No vpc should be shared in ${OndemandContracts.inst.networking.buildId}`)
        }

        const nwShares = [m.vpcConfig.ipAddresses.ipv4IpamPoolRef.producer]

        const tgwRef = m.vpcConfig.transitGatewayRef
        if (tgwRef) {
            nwShares.push(tgwRef.producer)
        }

        const shareIn = new ContractsShareIn(this, m.owner.buildId,
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
            Tags.of(sbn).add('Name', OdmdNames.create(sbn, '', 255), {
                priority: 100
            })
            sbn.node.children.filter(c => c instanceof CfnRouteTable).forEach(rt => {
                Tags.of(rt).add('Name', OdmdNames.create(rt, '', 255), {
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

        new ContractsShareOut(this, new Map<ContractsCrossRefProducer<AnyContractsEnVer>, string | number>([
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
        if( m.rdsConfigs.length>0 ){
            m.rdsConfigs.forEach(r=>{
                new RepoBuildCtlVpcRds(parent, this, r)
            })
        }

    }
}
