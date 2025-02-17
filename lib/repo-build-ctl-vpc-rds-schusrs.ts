import {App, Stack, StackProps} from "aws-cdk-lib";
import {
    OdmdNames,
    AnyOdmdEnVer,
    OdmdShareOut,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    OdmdEnverCdkDefaultVpc,
    OdmdRdsCluster,
    PgSchemaUsers,
    PgSchemaUsersProps
} from "@ondemandenv/contracts-lib-base";


export class RepoBuildCtlVpcRdsSchusrs extends Stack {
    constructor(parent: App, pn: string, rds: OdmdRdsCluster, m: PgSchemaUsersProps, props: StackProps) {
        super(parent, OdmdEnverCdk.SANITIZE_STACK_NAME(pn + '-' + m.schema), props);

        const pgUsrs = new PgSchemaUsers(this, m, true)

        new OdmdShareOut(this, new Map<OdmdCrossRefProducer<AnyOdmdEnVer>, string | number>(
            new Map(m.userSecrets.map(us => [rds.usernameToSecretId.get(us.userName)!, pgUsrs.usernameToSecretId.get(us.userName)!]))
        ))
    }

}

