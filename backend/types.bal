import ballerina/http;
import ballerina/time;

public type Plan record {|
    readonly string id;
    *NewPlan;
|};

public type NewPlan record {|
    string plan;
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
