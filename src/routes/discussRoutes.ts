import {Router} from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();




//add discussion
router.post("/", async (req,res) => { 
    const {text, image, hashTags, userId} = req.body;
    // @ts-ignore
    const user = req.user;
    
    try{
    const result = await prisma.discuss.create({
        data: {
           text,
           image,
           hashTags,    
           userId : user.id, 
        },
    });

    res.json(result);
} catch(e){
    res.status(400).json({
        error: "Username and email should be unique"
    });
}
});

//get discussion
router.get("/", async (req,res) =>{
    const allTweets = await prisma.discuss.findMany({
        include:{
            user:{
                select:{
            id:true,
            name:true,
        },
      },
    },
  }); 
    res.json(allTweets);
});


//find discussion
router.get("/:id", async (req,res) =>{
    const {id} = req.params;
    const tweet = await prisma.discuss.findUnique({where : {id: Number(id)} });
    if(!tweet){
        return res.json({error : "No such Discussion found"})
    }  
    res.json(tweet);
    });
  


//update 
router.put("/:id", async (req,res) =>{
    const {id} = req.params;
    const{text} = req.body;

    try{
        const result = await prisma.discuss.update({
            where: {id:Number(id)},
            data: {text}
        })
        res.json(result);
    } catch(e){
        res.status(400).json({error: 'Cannot Update !'});
    }
  
});


// delete 
router.delete("/:id", async(req,res) =>{
    const {id} = req.params;
    await prisma.discuss.delete({where: {id: Number(id)}}) 
    res.status(200).json({msg : "Discussion deleted Sucessfully"});
});

export default router;  