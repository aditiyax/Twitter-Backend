import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; 
import {error} from 'console';
require('dotenv').config();

const ses = new SESClient({});

function createSendEmailCommand(
    ToAddresses: string,
    fromAddress: string,
    message: string
) {
    return new SendEmailCommand({
        Destination : {
            ToAddresses: [ToAddresses],
        },
        Source: fromAddress,
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data : "Your one-time password"
            },
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: message
                },
            },
        },
    });
}

export async function sendEmailToken(email: string, token: string) {
    console.log("email: ", email, token);
 
    const message =  `Your one-time password: ${token}`;
    const command = createSendEmailCommand(
        email, "aditya11austin@gmail.com",
    message);

    try{
        return await ses.send(command)
    } catch(e) {
        console.log("Error send Email", e);
        return error;
    }

} 

