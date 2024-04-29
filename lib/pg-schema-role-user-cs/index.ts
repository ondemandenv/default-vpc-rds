import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CloudFormationCustomResourceResponse} from "aws-lambda/trigger/cloudformation-custom-resource";
import {User} from "./lib/user";
import {SchemaRoleInit} from "./lib/schemaRoleInit";

export async function handler(event: CloudFormationCustomResourceEvent, context: any): Promise<CloudFormationCustomResourceResponse> {

    console.log('>>>>')
    console.log(JSON.stringify(event))
    console.log('-----')
    console.log(JSON.stringify(process.env))
    console.log('<<<<')

    const userName = event.ResourceProperties.userName as string

    const aa: User | SchemaRoleInit = (userName && userName.length > 0) ? new User() : new SchemaRoleInit()

    await aa.initPgClient(event);
    await aa.pgClient.query(`BEGIN`)
    try {
        const rt = await aa.handler(event);
        await aa.pgClient.query(`COMMIT`)
        return rt
    } catch (e) {
        await aa.pgClient.query(`ROLLBACK`)
        throw e
    } finally {
        await aa.pgClient.end()
    }
}
