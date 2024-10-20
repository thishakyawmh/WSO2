import ballerina/http;
import ballerina/time;

public type Plan record {|
    readonly string id;
    *NewPlan;
    string PlanGuid?;
|};

public type NewPlan record {|
    string plan;
|};

public type PlanUpdate record {|
    string plan?;
    string PlanGuid?;
|};

type ErrorDetails record {
    string message;
    string details;
    time:Utc timeStamp;
};

type PlanNotFound record {|
    *http:NotFound;
    ErrorDetails body;
|};
