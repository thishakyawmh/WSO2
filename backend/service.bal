import ballerina/http;
import ballerina/uuid;
import ballerinax/mongodb;

configurable string host = "localhost";
configurable int port = 27017;

final mongodb:Client mongoDb = check new ({
    connection: {
        serverAddress: {
            host,
            port
        }
    }
});

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}

service /plans on new http:Listener(9090) {

    final mongodb:Database Plandb;

    function init() returns error? {
        self.Plandb = check mongoDb->getDatabase("Plans_DB");
    }

    resource function post plans(NewPlan newPlan) returns string|error {
        string id = uuid:createType1AsString();
        Plan plan = {id, ...newPlan};
        mongodb:Collection plans = check self.Plandb->getCollection("Plans");
        check plans->insertOne(plan);
        return id;
    }

    resource function get plans() returns Plan[]|error {
        mongodb:Collection plans = check self.Plandb->getCollection("Plans");
        stream<Plan, error?> result = check plans->find();
        return check from Plan p in result
            select p;
    }

    resource function get plans/[string id]() returns Plan|error {
        return getPlan(self.Plandb, id);
    }

    resource function put plans/[string id](PlanUpdate update) returns Plan|error {
        mongodb:Collection plans = check self.Plandb->getCollection("Plans");
        mongodb:UpdateResult updateResult = check plans->updateOne({id}, {set: update});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the plan with id ${id}`);
        }
        return getPlan(self.Plandb, id);
    }
}

isolated function getPlan(mongodb:Database db, string id) returns Plan|error {
    mongodb:Collection plans = check db->getCollection("Plans");
    stream<Plan, error?> findResult = check plans->find({id});
    Plan[] result = check from Plan p in findResult
        select p;
    if result.length() != 1 {
        return error(string `Failed to find a Plan with id ${id}`);
    }
    return result[0];
}
