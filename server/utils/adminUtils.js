import adminSchema from "../models/adminSchema.js";
import { message, status } from "./statusMessage.js";
import bcrypt from 'bcrypt'
export const initializeAdminData=async()=>{
    try {
        const result = await adminSchema.find();
        if (result.length==0) {
            console.log('admin credentail is going to be inserted');
            
            var adminObj={
                email:'admin@gmail.com',
                password: await bcrypt.hash('12345678',10) 
            }
            await adminSchema.create(adminObj);
            console.log("admin credential  inserted ");
            
            
        }else{
            console.log("Admin Credential already available");
            
        }
        return true;
    } catch (error) {
        console.log("error while initialize data");
        return false;
    }
}