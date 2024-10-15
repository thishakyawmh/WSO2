import ballerina/http;
import ballerina/io;
import ballerina/uuid;
import ballerinax/mongodb;

configurable string host = "localhost";
configurable int port = 27017;

configurable string username = "";
configurable string password = "";
configurable string database = "users";

public function main() {
    io:println("Ballerina application starting...");
}

final mongodb:Client mongoDb = check new ({
    connection: {
        serverAddress: {
            host,
            port
        }
    // auth: <mongodb:ScramSha256AuthCredential>{
    //     username,
    //     password,
    //     database
    // }
    }
});

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST"],
        allowHeaders: ["Authorization", "Content-Type"]
    }
}

service on new http:Listener(8081) {
    private final mongodb:Database usersDb;

    function init() returns error? {
        self.usersDb = check mongoDb->getDatabase("users");
    }

    // Resource for user signup (POST /signup)
    resource function post signup(UserInput input) returns User|error {
        string id = uuid:createType1AsString();
        User user = {id, ...input};
        mongodb:Collection users = check self.usersDb->getCollection("users");
        check users->insertOne(user);
        return user;
    }

    // Resource for user login (POST /login)
    resource function post login(LoginInput input) returns string|error {
        mongodb:Collection users = check self.usersDb->getCollection("users");
        stream<User, error?> result = check users->find({email: input.email, password: input.password});
        User[] usersArray = check from User u in result
            select u;
        if usersArray.length() == 1 {
            json response = {"message": "Login successful"};
            return response.toString();
        } else {
            json errorResponse = {"error": "Invalid username or password"};
            return error(errorResponse.toString());
        }
    }

    // Resource to handle GET /users
    resource function get users() returns User[]|error {
        mongodb:Collection users = check self.usersDb->getCollection("users");
        stream<User, error?> result = check users->find({});
        User[] usersArray = check from User u in result
            select u;
        return usersArray;
    }

    // Root endpoint (GET /)
    resource function get .() returns string {
        return "Welcome to the Day Out Planing System";
    }

}

public type UserInput record {|
    string username;
    string password;
    string email;
|};

public type LoginInput record {|
    string email;
    string password;
|};

public type User record {|
    readonly string id;
    *UserInput;
|};

