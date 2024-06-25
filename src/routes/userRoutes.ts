import {Router} from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//add users 
router.post("/", async (req,res) => { 
    const {email, name, contact } = req.body ;
   
    try{
    const result = await prisma.user.create({
        data: {
            email,
            name,
            contact,
        },
    }); 

    res.json(result);
} catch(e){
    res.status(400).json({
        error: "Username and email should be unique"
    });
}
});


//get users
router.get("/", async(req,res) =>{
    const allUser = await prisma.user.findMany({
        select: {
            id:true,
             name:true, 
            },
        });

  res.json(allUser);
});


//find one user
router.get("/:id", async (req,res) =>{
    const {id} = req.params;
    const user = await prisma.user.findUnique({where : {id: Number(id)},
include:{discuss: true},    
 });
    res.json(user);
});


//update 
router.put("/:id", async (req,res) =>{
    const {id} = req.params;
    const {contact, name} = req.body;

    try{
        const result = await prisma.user.update({
            where: {id: Number(id)},
            data: {contact, name}
        })
        res.json(result);
    } catch(e) {
        res.status(400).json({error: `Failed to update the user`});
    }

    
});


// delete 
router.delete("/:id", async(req,res) =>{
    const {id} = req.params;
    await prisma.user.delete({where: {id: Number(id)}})
    res.sendStatus(200);
});


export default router;