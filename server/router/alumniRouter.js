import express, { request, response } from "express";
import jwt from 'jsonwebtoken';
import { alumniRegistrationController,alumniEmailVerifyController,alumniLoginController,alumniJobHostingController,alumniViewJobController,alumniDeleteJobController,alumniUpdateJobController,alumniJobUpdateController,alumniAddForumTopicController,alumniAddForumController,alumniViewMyForumController,alumniViewAllForumController,alumniForumUpdateController,alumniDeleteForumController,alumniJoinForumController,alumniForumChatController,alumniViewEventsController,alumniAcceptInvitationController ,alumniDeclainInvitationController,alumniViewGalleryController,alumniLogoutController, AlumniViewForumChatController} from "../controller/alumniController.js";
import { message, status } from "../utils/statusMessage.js";
import dotenv from 'dotenv';
import expressFileUpload from "express-fileupload";

import cookieParser from 'cookie-parser';
dotenv.config();
const ALUMNI_SECRET=process.env.ALUMNI_SECRET;
const alumniRouter=express.Router();

alumniRouter.use(expressFileUpload())
alumniRouter.use(cookieParser())

alumniRouter.post('/alumniRegistration',alumniRegistrationController);
alumniRouter.post('/alumniEmailVerify',alumniEmailVerifyController);
alumniRouter.post('/alumniLogin',alumniLoginController);
const authenticateJWT=(request,response,next)=>{
    try {
        let token = request.cookies.alumni_jwt;
        
        if (!token) {
            const cookies = request.cookies;
            for (const cookieName in cookies) {
                if (cookieName.startsWith('alumni_jwt_')) {
                    token = cookies[cookieName];
                    break;
                }
            }
        }
        
        
        if (!token) {
            return response.status(401).json({
                message: "Authentication required. Please login.",
                status: status.ERROR
            });
        }
        
        jwt.verify(token, ALUMNI_SECRET, (error, payload) => {
            if (error) {
                return response.status(401).json({
                    message: "Invalid or expired session. Please login again.",
                    status: status.ERROR
                });
            } else {
                request.payload = payload;
                next();
            }
        });
    } catch (error) {
        return response.status(500).json({
            message: "Server error during authentication",
            status: status.ERROR
        });
    }
}
const authorizeJWT=(request,response,next)=>{
    try {
        if (request.payload && request.payload.role=='alumni') {
            next();
        } else {
            return response.status(403).json({
                message: "Access denied. Alumni role required.",
                status: status.ERROR
            });
        }
    } catch (error) {
        return response.status(500).json({
            message: "Server error during authorization",
            status: status.ERROR
        });
    }
}
alumniRouter.post('/alumniJobHosting',authenticateJWT,alumniJobHostingController);
alumniRouter.post('/alumniViewJob',authenticateJWT,authorizeJWT,alumniViewJobController);
alumniRouter.post('/alumniDeleteJob',authenticateJWT,authorizeJWT,alumniDeleteJobController);
alumniRouter.post('/alumniUpdateJob',authenticateJWT,authorizeJWT,alumniUpdateJobController);
alumniRouter.post('/alumniJobUpdate',authenticateJWT,authorizeJWT,alumniJobUpdateController);
alumniRouter.get('/alumniAddForumTopic',authenticateJWT,alumniAddForumTopicController);
alumniRouter.post('/alumniAddForumTopic',authenticateJWT,authorizeJWT,alumniAddForumController);
alumniRouter.post('/alumniViewMyForum',authenticateJWT,authorizeJWT,alumniViewMyForumController);
alumniRouter.get('/alumniViewAllForum',authenticateJWT,authorizeJWT,alumniViewAllForumController);
alumniRouter.post('/alumniForumUpdate',authenticateJWT,alumniForumUpdateController);
alumniRouter.post('/alumniDeleteForum',authenticateJWT,alumniDeleteForumController);
alumniRouter.post('/alumniJoinForum',authenticateJWT,alumniJoinForumController);
alumniRouter.post('/alumniForumChatView',authenticateJWT, AlumniViewForumChatController);
alumniRouter.post('/alumniForumChat',authenticateJWT,alumniForumChatController);
alumniRouter.get('/alumniViewEvents',authenticateJWT,alumniViewEventsController);
alumniRouter.post('/alumniAcceptInvitation',authenticateJWT,authorizeJWT,alumniAcceptInvitationController);
alumniRouter.post('/alumniDeclainInvitation',authenticateJWT,authorizeJWT,alumniDeclainInvitationController);
alumniRouter.get('/alumniViewGallery',authenticateJWT,alumniViewGalleryController);
alumniRouter.get('/alumniLogout',alumniLogoutController);

export default alumniRouter;