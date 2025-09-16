import jwt from "jsonwebtoken";
import adminSchema from "../models/adminSchema.js";
import { message, status } from "../utils/statusMessage.js";
import bcrypt from "bcrypt";
import uuid from 'uuid4'
import dotenv from "dotenv";
import { request, response } from "express";
import moment from "moment";
import eventSchema from "../models/eventSchema.js";
import alumniSchema from "../models/alumniSchema.js";
import jobSchema from "../models/jobSchema.js";
import forumSchema from "../models/forumSchema.js";
import eventConfirmationSchema from "../models/eventConfirmationSchema.js";
import uuid4 from "uuid4";
import gallerySchema from "../models/gallerySchema.js";
dotenv.config();
export const adminLoginController = async (request, response) => {
  try {
    const { email, password } = request.body;
    console.log(password);
    const adminObj = await adminSchema.findOne({ email });
    const adminEmail = adminObj.email;
    const adminPassword = adminObj.password;
    const adminStatus = await bcrypt.compare(password, adminPassword);
    console.log(adminStatus);

    if (adminStatus) {
      const adminPayload = {
        email: request.body.email,
        role: "admin",
      };
      const expiryTime = {
        expiresIn: "1d",
      };
      const token = jwt.sign(
        adminPayload,
        process.env.ADMIN_SECRET,
        expiryTime
      );
      const isProd = process.env.NODE_ENV === 'development';

      response.cookie('admin_jwt', token, {
        httpOnly: true,
        path: '/',            // explicit
        sameSite: isProd ? 'Lax' : 'Lax', // explicit default
        secure: isProd,       // true on HTTPS in prod
        maxAge: 24 * 60 * 60 * 1000,
      });

      return response.json({ success: true, message: "Login Successful" }, { status: 200 });

    } else {
      return response.json({ success: false, message: message.ADMIN_CREDENTAIL_ERROR }, { status: 401 });
    }
  } catch (error) {
    console.log("error while login admin", error);
    return response.json({ success: false, message: message.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
export const adminHomeController = async (request, response) => {
  try {
    response.render("adminHome", { email: request.payload.email, message: '', status: '' });
    // const uploadDate=
  } catch (error) {
    console.log("error in admin home controller ", error);
  }
};
export const adminEventController = async (request, response) => {
  try {
    console.log(request.body);
    request.body.eventId = uuid();
    request.body.uploadDate = moment(new Date()).format('DD-MM-YY');
    request.body.uploadTime = moment(new Date()).format('hh-mm-ss A');
    const res = await eventSchema.create(request.body);
    response.status(201).json({ success: true, message: message.EVENT_ADDED });
    // console.log(res);

  } catch (error) {
    console.log("error while admin event controller", error);
    response.status(500).json({ success: false, message: message.EVENT_NOT_ADDED });
  }
}

export const adminViewEventController = async (request, response) => {
  try {
 const eventData = await eventSchema.find({
       status: true, eventEndDate: {
         $gte: moment().format('YYYY-MM-DD')
       }
     });
  

    response.status(200).json({ events: eventData.reverse(), message: message.EVENT_LISTED, status: status.SUCCESS });
  } catch (error) {
    console.log("error while view events controller");
    response.status(500).json({ events: [], message: message.SOMETHING_WENT_WRONG, status: status.ERROR });
  }
}
export const adminDeleteEventController = async (request, response) => {
  try {
    const eventId = request.body.eventId;
    const updateStatus = {
      $set: {
        status: false
      }
    }
    const res = await eventSchema.updateOne({ eventId }, updateStatus);
 
    response.status(200).json({ success: true, message: message.EVENT_DELETED });

  } catch (error) {
    console.log("error while deleting event controller");
    response.status(500).json({ success: false, message: message.EVENT_DELETE_ERROR });
  }
}
export const  adminUpdateEventController = async (request, response) => {
  try {
    const eventId = request.body.eventId;
    console.log(eventId);
    const eventData = await eventSchema.findOne({ eventId });
    response.status(200).json({ eventData, message:'', status: status.SUCCESS })
  } catch (error) {
    console.log("error while updating event ", error);
    // response.render('adminHome',{email:request.payload.email,message:message.EVENT_DELETE_ERROR,status:status.ERROR});
    response.status(500).json({ eventData: eventData.reverse(), message: message.SOMETHING_WENT_WRONG, status: status.ERROR })

  }
}

export const adminEventUpdateController = async (request, response) => {
  try {
    console.log("event update controller",request.body.eventId);
    const status = {
      $set: request.body
    }
    const res = await eventSchema.updateOne({ eventId: request.body.eventId }, status);
    response.status(200).json({ success: true, message: message.EVENT_UPDATED });

  } catch (error) {
    console.log("error while event update controller");
    response.status(500).json({ success: false, message: message.EVENT_UPDATE_ERROR });

  }
}
export const adminAlumniListController = async (request, response) => {
  try {
    const alumniData = await alumniSchema.find();
    // response.render('adminAlumniList', { alumniData, email: request.payload.email, message: '', status: status.SUCCESS });
    response.json({ items: alumniData, total: alumniData.length, message: '' }, { status: 200 });
  } catch (error) {
    console.log("error while admin alumni list controller", error);
    // response.render('adminHome', { email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });
   response.json({ items: [], total: 0, message: message.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
export const adminVerifyAlumniController = async (request, response) => {
  try {
    const alumniId = request.body.alumniId;
    const status = {
      $set: {
        adminVerify: 'verified'
      }
    }
    const res = await alumniSchema.updateOne({ alumniId }, status);
    console.log("alumni admin verify ", res);
  
    response.status(200).json({ success: true, message: message.ALUMNI_VERIFIED });
  } catch (error) {
    console.log("Error while AdminVerifyAlumni Controller", error);
    response.status(500).json({ success: false, message: message.SOMETHING_WENT_WRONG });
  }
}
export const adminViewJobController = async (request, response) => {
  try {
    const jobData = await jobSchema.find({ status: true });
    response.status(200).json({ jobData, message: '', status: status.SUCCESS });
  } catch (error) {
    console.log("Error while admin View Job Controller", error);
    response.status(500).json({ jobData: [], message: message.SOMETHING_WENT_WRONG, status: status.ERROR });


  }
}
export const adminViewForumController = async (request, response) => {
  try {

    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: '', status: '' });
  } catch (error) {
    console.log("error while admin view forum controller", error);
    response.render('adminHome', { email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });


  }
}
export const adminUpdateForumController = async (request, response) => {
  try {
    const forumId = request.body.forumId;
    const forumData = await forumSchema.findOne({ forumId });
    response.render('adminUpdateForum', { forumData, email: request.payload.email, message: '', status: status.SUCCESS });
  } catch (error) {
    console.log("error while admin update forum controller ", error);
    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });

  }
}
export const adminForumUpdateController = async (request, response) => {
  try {
    const forumId = request.body.forumId;
    // console.log(forumID)/;
    console.log(request.body);
    const updateStatus = {
      $set: request.body
    }
    const updateData = await forumSchema.updateOne({ forumId }, updateStatus);
    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: message.FORUM_UPDATED, status: status.SUCCESS });


  } catch (error) {
    console.log("error while admin froum update controller", error);
    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });


  }
}

export const adminForumDeleteController = async (request, response) => {
  try {
    const forumId = request.body.forumId;
    const status = {
      $set: {
        status: false
      }
    }
    const forumData = await forumSchema.updateOne({ forumId }, status);
    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: message.FORUM_DELETED, status: status.SUCCESS });

  } catch (error) {
    console.log("error while admin froum delete controller", error);
    const forumAllData = await forumSchema.find({ status: true });
    response.render("adminViewForum", { forumAllData, email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });

  }
}
export const adminViewAlumniStatusController = async (request, response) => {
  try {
    const alumniConfirmationData = await eventConfirmationSchema.find({ status: true });
    response.status(200).json({
      items: alumniConfirmationData,
      status: status.SUCCESS,
      message: ''
    })
  } catch (error) {
    console.log("error in adminViewAlumniStatusController", error);
    response.status(500).json({
      items: [],
      status: status.ERROR,
      message: message.SOMETHING_WENT_WRONG
    })

  }
}
export const adminUploadImagesController = async (request, response) => {
  try {
    console.log('Request files:', request.files);
    console.log('Request body:', request.body);
    
    // Check if files were uploaded
    if (!request.files || !request.files.images) {
      return response.status(400).json({
        message: 'No images uploaded',
        status: 'ERROR'
      });
    }

    // Handle both single file and multiple files
    const imageFiles = Array.isArray(request.files.images) ? request.files.images : [request.files.images];
    console.log('Image files array:', imageFiles);
    
    var arrFileName = [];
    // Process all uploaded files
    for (var i = 0; i < imageFiles.length; i++) {
      if (imageFiles[i] && imageFiles[i].filename) {
        arrFileName.push(imageFiles[i].filename);
      }
    }
    
    console.log('Processed filenames:', arrFileName);
    
    if (arrFileName.length === 0) {
      return response.status(400).json({
        message: 'No valid image files found',
        status: 'ERROR'
      });
    }
    
    var obj = {
      galleryId: uuid4(),
      eventId: request.body.eventId,
      images: arrFileName
    }
    
    console.log('Creating gallery object:', obj);
    const result = await gallerySchema.create(obj);
    console.log('Database result:', result);

    response.status(200).json({
      message: 'Images uploaded successfully',
      status: 'SUCCESS',
      uploadedFiles: arrFileName.length
    });
  } catch (error) {
    console.log("error in adminUploadImagesController", error);
    response.status(500).json({
      message: 'Something went wrong during upload',
      status: 'ERROR',
      error: error.message
    });
  }
}

export const adminLogoutController = async (request, response) => {
  try {
    response.clearCookie('admin_jwt');
    response.render('adminLogin', { message: message.LOGOUT_SUCCESSFULL, status: status.SUCCESS });
  } catch (error) {
    console.log("error in adminLogoutController", error);
    response.render("adminHome", { email: request.payload.email, message: message.SOMETHING_WENT_WRONG, status: status.ERROR });
  }
}