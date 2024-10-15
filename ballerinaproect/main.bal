import ballerina/http;
import ballerina/io;

service / on new http:Listener(8080) {

    resource function get .(http:Caller caller, http:Request req) {
        var htmlFile = io:fileReadString("./resources/index.html");
        if (htmlFile is string) {
            http:Response res = new;
            var setTypeResult = res.setContentType("text/html");
            if (setTypeResult is error) {
                checkpanic caller->respond("Error setting content type");
                return;
            }
            res.setPayload(htmlFile);
            checkpanic caller->respond(res);
        } else {
            checkpanic caller->respond("Error reading HTML file");
        }
    }

    resource function get styles(http:Caller caller, http:Request req) {
        var cssFile = io:fileReadString("./resources/css/styles.css");
        if (cssFile is string) {
            http:Response res = new;
            var setTypeResult = res.setContentType("text/css");
            if (setTypeResult is error) {
                checkpanic caller->respond("Error setting content type");
                return;
            }
            res.setPayload(cssFile);
            checkpanic caller->respond(res);
        } else {
            checkpanic caller->respond("Error reading CSS file");
        }
    }
}