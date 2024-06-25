import { Router} from "express";
import { PrismaClient } from "@prisma/client";
import { sendEmailToken } from "../services/emailService";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10*60*1000;
const AUTHENTICATION_EXPIRATION_HOURS = 12*60*60*1000;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER SECRET';

// Generate a random 8 digit number as the email token
    function generateEmailToken(): string{
        return Math.floor(10000000 + Math.random() * 90000000).toString(); 
    }

    function generateAuthToken(TokenId: number): string{
      const jwtPayload = {TokenId};
      return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: "HS256",
        noTimestamp : true
      } )
      
    }

// Create a user, if it doesnt exists
// generate the emailToken and send it to thier email
router.post('/login', async (req, res) => {
    const { email } = req.body;
  
    // generate token
    const emailToken = generateEmailToken();
    const expiration = new Date(
      new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );
  
    try {
      const createdToken = await prisma.token.create({
        data: {
          type: 'EMAIL',
          emailToken,
          expiration,
          user: {
            connectOrCreate: {
              where: { email },
              create: { email },
            },
          },
        },
      });
  
      console.log(createdToken);
      // TODO send emailToken to user's email
      await sendEmailToken(email, emailToken);
   
      res.sendStatus(200);
    } catch (e) {
      console.log(e);
      res
        .status(400)
        .json({ error: "Couldn't start the authentication process" });
    }
  });

    // Validate the emailToken
    // Generate a long-lived JWT Token

    router.post('/authenticate', async(req,res)=>{
      const {email, emailToken} = req.body;

      const dbEmailToken = await prisma.token.findUnique({
        where : {
          emailToken,
        },
        include : {
          user: true
        },
      });

      console.log(dbEmailToken);
      if(!dbEmailToken || !dbEmailToken.valid){
        return res.sendStatus(401);  
      }

      if(dbEmailToken.expiration < new Date()){
        return res.status(401).json({
          error : "Token Expired !"
        });
      }

       if(dbEmailToken?.user?.email != email){
        return res.sendStatus(401);
       }

       //Here are validating if the user is the owner of the Token

      //  generate an API token
      const expiration = new Date(
        new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS
      );

      const apiToken = await prisma.token.create({
        data:{
          type:'API',
          expiration,
          user:{
            connect:{
              email,
            },
          },
        },
      });

      // Invalidate the email
      await prisma.token.update({
        where: { id:dbEmailToken.id },
        data: { valid: false},
        });

        // generate the JWT Token
         const authToken = generateAuthToken(apiToken.id);   

      res.json({authToken});
    });

export default router;