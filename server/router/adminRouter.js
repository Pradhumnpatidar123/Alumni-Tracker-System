import express, { request, response } from 'express';
import { adminLoginController,adminHomeController,adminEventController,adminViewEventController,adminDeleteEventController,adminUpdateEventController,adminEventUpdateController,adminAlumniListController,adminVerifyAlumniController,adminViewJobController,adminViewForumController,adminUpdateForumController,adminForumUpdateController,adminForumDeleteController,adminViewAlumniStatusController,adminUploadImagesController,adminLogoutController} from '../controller/adminController.js';
import { message, status } from '../utils/statusMessage.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
const ADMIN_SECRET=process.env.ADMIN_SECRET;
var adminRouter=express.Router();
adminRouter.post('/adminlogin',adminLoginController);
const authenticateJWT=(request,response,next)=>{
    try {
        const token=request.cookies.admin_jwt;
        if (!token) {
            console.log("error while fatching with token");
            
            return response.status(401).json({ message: message.UNAUTHORIZED, status: status.ERROR });
        }
        jwt.verify(token,ADMIN_SECRET,(error,payload)=>{
        if (error) {
            console.log("error while verifing admin",error);
            response.status(401).json({ message: message.UNAUTHORIZED, status: status.ERROR });
        }else{
                request.payload=payload;
                next();
        }
        })
    } catch (error) {
        console.log("error while authenticate jwt",error);
        response.status(500).json({ message: message.SOMETHING_WENT_WRONG, status: status.ERROR });
    }
}
const authorizeJWT=(request,response,next)=>{
    try {
        if (request.payload.role=='admin') {
            next();
       
        }
    } catch (error) {
        console.log("error while authirise admin ",error);
        response.status(500).json({ message: message.SOMETHING_WENT_WRONG, status: status.ERROR });
        
    }
}
adminRouter.get('/adminhome',authenticateJWT,authorizeJWT,adminHomeController);
adminRouter.post('/adminAddEvent',adminEventController);
adminRouter.get('/adminViewEvents',adminViewEventController);
adminRouter.get('/alumniList',adminAlumniListController);
adminRouter.post('/adminDeleteEvent',adminDeleteEventController);
adminRouter.post('/adminUpdateEvent',adminUpdateEventController);
adminRouter.post('/adminEventUpdate',adminEventUpdateController);
adminRouter.post('/adminVerifyAlumni',authenticateJWT,adminVerifyAlumniController);
adminRouter.get('/adminViewJob',authenticateJWT,adminViewJobController);
adminRouter.get('/adminViewForum',authenticateJWT,adminViewForumController);
adminRouter.post('/adminUpdateForum',authenticateJWT,adminUpdateForumController);
adminRouter.post('/adminForumUpdate',authenticateJWT,adminForumUpdateController);
adminRouter.post('/adminDeleteForum',authenticateJWT,adminForumDeleteController);
adminRouter.get('/adminViewAlumniStatus',adminViewAlumniStatusController);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fixed multer configuration with absolute path
const storage=multer.diskStorage({
    destination: (req, file, cb) => {
        // Use absolute path instead of relative path
        const uploadPath = path.join(__dirname, '../../ui/public/images');
        cb(null, uploadPath);
    },
    filename:(request,fileObj,callback)=>{
        callback(null,new Date().getTime()+'-'+fileObj.originalname)
    }
});

// Add error handling for multer
const uploads=multer({
    storage:storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).fields([{name:'images',maxCount:100}]);

// Add error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'File too large. Maximum file size is 5MB.', 
                status: 'ERROR' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                message: 'Too many files uploaded. Maximum 100 files allowed.', 
                status: 'ERROR' 
            });
        }
        return res.status(400).json({ 
            message: 'Multer error: ' + err.message, 
            status: 'ERROR' 
        });
    }
    next(err);
};

// Apply multer middleware with error handling
adminRouter.post('/adminUploadImages', uploads, handleMulterError, (req, res, next) => {
    // Check if files were uploaded
    if (!req.files) {
        return res.status(400).json({ 
            message: 'No files uploaded', 
            status: 'ERROR' 
        });
    }
    next();
}, adminUploadImagesController);

adminRouter.get('/adminLogout', authenticateJWT,adminLogoutController);
export default adminRouter;