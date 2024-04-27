import {Base} from "./base";
import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceUpdateEvent} from "aws-lambda";
import {CloudFormationCustomResourceResponse} from "aws-lambda/trigger/cloudformation-custom-resource";


//https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/
export class SchemaRoleInit extends Base {

    public async handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
        await super.handler(event)

        if (event.RequestType == 'Create') {
            await this.pgClient.query(`create schema IF NOT EXISTS "${this.schemaName}"`)
            try {
                await this.pgClient.query(`BEGIN`)
                await this.createChangeTableOwnerTriggerAndFunc()//todo: move to database scope, because 1) role is global; 2) trigger is owned by db 3) function can be owned by schema ... and no more: format('%s_mig', obj.schema_name

                await this.createAppRole()
                await this.createMigrateRole()
                await this.createReadonlyRole()

                await this.changeExistingTableOwner()

                await this.pgClient.query(`COMMIT`)
            } catch (e) {
                await this.pgClient.query(`ROLLBACK`)
                throw e
            }
        } else if (event.RequestType == 'Delete') {
            await this.deleteAll();
        } else {
            const updateEvent = event as CloudFormationCustomResourceUpdateEvent
            if (this.databaseName != updateEvent.OldResourceProperties.databaseName) {
                throw new Error(`No database name Change( ${updateEvent.OldResourceProperties.databaseName} -> ${this.databaseName} ) allowed!`)
            }
            if (this.schemaName != updateEvent.OldResourceProperties.schemaName) {
                throw new Error(`No schema name Change( ${updateEvent.OldResourceProperties.schemaName} -> ${this.schemaName} ) allowed!`)
            }
        }
        await this.printUsrRoleStatus();

        return {
            PhysicalResourceId: `rds-schema-${this.schemaName}`,
            StackId: event.StackId,
            RequestId: event.RequestId,
            Data: {},
            Status: "SUCCESS",
            LogicalResourceId: event.LogicalResourceId
        }
    }

    private async deleteAll() {

        for (const roleName of this.all3roles) {
            try {
                console.log(`deleting role:${roleName}`)
                await this.pgClient.query(`REASSIGN OWNED BY ${roleName} TO "${this.adminUsername}"`)
                await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" revoke all privileges ON TABLES from ${roleName}`)
                await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" revoke USAGE ON SEQUENCES from ${roleName}`)
                await this.pgClient.query(`revoke usage on all sequences in schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges on all tables in schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges on schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges ON DATABASE "${this.databaseName}" from ${roleName}`)
                await this.pgClient.query(`drop role ${roleName}`)
                console.log(`deleted role:${roleName}`)
            } catch (e) {
                console.error(`error deleting role:${roleName}` + e)
            }
        }

        try {
            await this.pgClient.query(`drop schema "${this.schemaName}"`)
        } catch (e) {
            console.info('deleting schema fails when there is data:' + e)
        }
    }


    protected async createRoleGrantDBSchema(roleName: string) {
        if (!this.all3roles.includes(roleName)) {
            throw new Error(`illegal role name: ${roleName}`)
        }
        await this.pgClient.query(`create role ${roleName}`)
        await this.pgClient.query(`grant connect, temp on database "${this.databaseName}" to ${roleName}`)
        await this.pgClient.query(`grant usage on schema "${this.schemaName}" to ${roleName}`)
    }

    protected async createAppRole() {
        const postgresRole = this.appRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant insert, select, update, delete on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`GRANT USAGE ON ALL SEQUENCES IN SCHEMA  "${this.schemaName}" to ${postgresRole}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT insert, select, update, delete ON TABLES TO ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO ${postgresRole}`)
    }


    protected async createReadonlyRole() {
        const postgresRole = this.readonlyRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant select on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT select ON TABLES TO ${postgresRole}`)
    }

    protected async createMigrateRole() {
        const postgresRole = this.migRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant all privileges on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`GRANT USAGE ON ALL SEQUENCES IN SCHEMA  "${this.schemaName}" to ${postgresRole}`)

        await this.pgClient.query(`grant all PRIVILEGES ON SCHEMA "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`grant all PRIVILEGES ON database "${this.databaseName}" to ${postgresRole}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT all privileges ON TABLES TO ${postgresRole}`)
    }


    protected async createChangeTableOwnerTriggerAndFunc() {
        // const tmp = await this.pgClient.query(`select current_user;`);
        // const tmp1 = await this.pgClient.query(`select session_user;`);
        // const tmp2 = await this.pgClient.query(`select current_database();`);
        // const tmp3 = await this.pgClient.query(`SELECT * FROM pg_event_trigger;`);
        // const tmp4 = await this.pgClient.query(`SELECT * FROM pg_proc  where proname='change_owner_function';`);

        await this.pgClient.query(`

DROP EVENT TRIGGER IF EXISTS change_table_owner_on_created;
DROP FUNCTION IF EXISTS change_owner_function();

CREATE FUNCTION change_owner_function()
RETURNS event_trigger AS
$$
DECLARE
    obj RECORD;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
    LOOP
        IF obj.schema_name IN ('pg_catalog', 'information_schema') OR obj.schema_name LIKE 'pg_%' THEN
            CONTINUE;
        END IF;
        
        EXECUTE format('ALTER TABLE %I.%I OWNER TO %I', obj.schema_name, obj.object_name, format('%s_mig', obj.schema_name));
    END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE EVENT TRIGGER change_table_owner_on_created ON ddl_command_end 
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION change_owner_function();

`);
    }

    protected async changeExistingTableOwner() {
        await this.pgClient.query(`
DO $$
    DECLARE
        text TEXT;
    BEGIN
        FOR text IN
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = '${this.schemaName}'
              AND tableowner <> '${this.migRoleName}'
            LOOP
                EXECUTE format('ALTER TABLE %I.%I OWNER TO ${this.migRoleName}', '${this.schemaName}', text);
            END LOOP;
    END $$;
`)
    }
}