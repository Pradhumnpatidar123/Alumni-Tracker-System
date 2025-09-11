import { message, status } from "../utils/statusMessage.js";
import uuid4 from "uuid4";
import mailer from "./mailer.js";
// import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();// import path, { parse } from "path";

import alumniSchema from "../models/alumniSchema.js";
import { request } from "http";
import moment from "moment";
import jobSchema from "../models/jobSchema.js";
import jwt from "jsonwebtoken";
import forumSchema from "../models/forumSchema.js";
import forumMemberSchema from "../models/forumMemberSchema.js";
import forumChatSchema from "../models/forumChatSchema.js";
import eventSchema from "../models/eventSchema.js";
import eventConfirmationSchema from "../models/eventConfirmationSchema.js";
import gallerySchema from "../models/gallerySchema.js";
import e from "express";
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIO } from '../socket/index.js';

// export const alumniRegistrationController = async (request, response) => {
//   try {
//     console.log("alumni registration controller called");
//     console.log(request.body);

//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     request.body.alumniId = uuid4();
//     const filename = request.files.profile;
//     const fileName = new Date().getTime() + filename.name;
//     request.body.profile = fileName;
//     request.body.password = await bcrypt.hash(request.body.password, 10);
//     const pathName = path.join(
//       __dirname.replace("\\controller", "") + "/public/document/" + fileName
//     );
//     // console.log(request.body);
//     // console.log(request.files);
//     mailer.mailer(request.body.email, (value) => {
//       if (value) {
//         filename.mv(pathName, async (error) => {
//           try {
//             const alumniRes = await alumniSchema.create(request.body);
//             console.log("alumni result", alumniRes);
//             // success
//             return response.status(201).json({
//               message: message.WAIT_FOR_ADMIN_APROVAL,
//               status: status.SUCCESS
//             });

//           } catch (error) {
//             console.log("error while uploading Image :", error);
//             response.json({
//               message: message.PROFILE_UPLOADING_ERROR,
//               status: status.ERROR,
//             }, { status: 500 }
//             );
//           }
//         });
//       } else {
//         console.log();
     
//         response.status(400).json({
//           message:"message.ERROR_SEND_MAIL",
//           status: status.ERROR,
//         });
//       }
//     });
//   } catch (error) {
//     console.log("error while alumni registration",error);
//     response.status(500).json({
//       message: message.SOMETHING_WENT_WRONG,
//       status: status.ERROR,
//     });
    
//   }
// };
export const alumniRegistrationController = async (request, response) => {
  try {
    console.log("alumni registration controller called");
    console.log(request.body);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    request.body.alumniId = uuid4();
    const filename = request.files.profile;
    const fileName = new Date().getTime() + filename.name;
    request.body.profile = fileName;
    request.body.password = await bcrypt.hash(request.body.password, 10);

    const pathName = path.join(
      __dirname.replace("\\server\\controller", "") + "/ui/public/img/" + fileName
    );

    // Ensure the destination directory exists before moving the file
    const dir = path.dirname(pathName);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    mailer.mailer(request.body.email, (value) => {
      if (value) {
        filename.mv(pathName, async (error) => {
          // Handle mv errors explicitly
          if (error) {
            console.log("error while moving Image :", error);
            return response.status(500).json({
              message: message.PROFILE_UPLOADING_ERROR,
              status: status.ERROR,
            });
          }

          try {
            const alumniRes = await alumniSchema.create(request.body);
            console.log("alumni result", alumniRes);
            // success
            return response.status(201).json({
              message: message.WAIT_FOR_ADMIN_APROVAL,
              status: status.SUCCESS
            });
          } catch (error) {
            console.log("error while uploading Image :", error);
            return response.status(500).json({
              message: message.PROFILE_UPLOADING_ERROR,
              status: status.ERROR,
            });
          }
        });
      } else {
        console.log();
        return response.status(400).json({
          message:"message.ERROR_SEND_MAIL",
          status: status.ERROR,
        });
      }
    });
  } catch (error) {
    console.log("error while alumni registration", error);
    return response.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};


export const alumniEmailVerifyController = async (request, response) => {
  try {
    const email = request.body.email;
    const status = {
      $set: {
        emailVerify: "verified",
      },
    };
    const res = await alumniSchema.updateOne({ email }, status);
    return response.status(200).json( {
      message: message.EMAIL_VERIFIED,
      status: status.SUCCESS,

    });
  } catch (error) {
    console.log("error while verifing mail",error);
  return response.status(404).json( {
      message: message.ERROR_VERIFY_MAIL,
      status: status.ERROR,
    });
  }
};
export const alumniLoginController = async (request, response) => {
  try {
    const { email, password } = request.body;
    const alumniObj = await alumniSchema.findOne({ email });

    // Check if alumni exists
    if (!alumniObj) {
     return response.status(401).json( {
      message: message.LOGIN_ERROR,
      status: status.ERROR,
        success: false
    });
    }

    // Check password
    const alumniStatus = await bcrypt.compare(password, alumniObj.password);

    // Check emailVerify and adminVerify
    if (alumniObj.emailVerify != 'verified') {
       return response.status(404).json( {
      message: 'Please verify your email address',
      status: status.ERROR,
      success: false

    });
    }

    if (alumniObj.adminVerify != 'verified') {
       return response.status(404).json( {
      message: message.WAIT_FOR_ADMIN_APROVAL,
      status: status.ERROR,
      success: false
    });
    }

    if (alumniStatus) {
      const alumniPayload = {
        email,
        username: alumniObj.username,
        role: "alumni",
      };

      const token = jwt.sign(alumniPayload, process.env.ALUMNI_SECRET, {
        expiresIn: "1d",
      });

      const isProd = process.env.NODE_ENV === 'production';

      response.cookie("alumni_jwt", token, {
        httpOnly: true,
        path: '/',
        sameSite: 'Lax',
        secure: isProd,       // false for HTTP (development), true for HTTPS (production)
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

    return response.status(200).json( {
      message:'',
      status: status.SUCCESS,
      success: true

    });
    } else {
       return response.status(400).json( {
      message: message.LOGIN_ERROR,
      status: status.ERROR,
        success: false
    });
    }
  } catch (error) {
    console.log("Error while logging in alumni:", error);
     return response.status(400).json( {
      message: message.LOGIN_ERROR,
      status: status.ERROR,
        success: false
    });
  }
};


export const alumniJobHostingController = async (request, response) => {
  try {
  
    request.body.form.jobId = uuid4();
    const alumniObj = await alumniSchema.findOne(
      { email:request.body.email},
      { alumniId: 1 }
    );
    request.body.form.alumniId = alumniObj.alumniId;
    const res = await jobSchema.create(request.body.form);
  return response.status(201).json( {
      message: message.JOB_SUCCESS_STATUS,
      status: status.SUCCESS,
    });

    // console.log(request.body);
  } catch (error) {
    console.log("Error While AlumniJobHostingController", error);

    return response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniViewJobController = async (request, response) => {
  try {
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
      { alumniId: 1 }
    );
    const jobData = await jobSchema.find({
      $and: [{ alumniId: alumniObj.alumniId }, { status: true }],
    });

    response.status(200).json( {
      jobData: jobData.reverse(),
      message: "",
      status: status.SUCCESS,
    });
  } catch (error) {
    response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniDeleteJobController = async (request, response) => {
  try {
   
    const jobId = request.body.jobId;
    const deleteStatus = {
      $set: {
        status: false,
      },
    };
    const res = await jobSchema.updateOne({ jobId }, deleteStatus);
    // console.log(res);
    // const jobData = await jobSchema.find({
    //   $and: [{ alumniId: alumniObj.alumniId }, { status: true }],
    // });

    response.status(200).json( {
      // jobData: jobData.reverse(),
      message: message.JOB_DELETED,
      status: status.SUCCESS,
    });

  } catch (error) {
    console.log("error while alumni job update", error);

    response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniUpdateJobController = async (request, response) => {
  try {
    const jobId = request.body.jobId;
    const job = await jobSchema.findOne({ jobId });
    response.status(200).json( {
      job,
      message: "",
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error while alumni job delete", error);

    const alumniObj = await alumniSchema.findOne(
      { email: request.payload.email },
      { alumniId: 1 }
    );
    const jobData = await jobSchema.find({
      $and: [{ alumniId: alumniObj.alumniId }, { status: true }],
    });
    response.render("alumniViewJob", {
      jobData: jobData.reverse(),
      email: request.payload.email,
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniJobUpdateController = async (request, response) => {
  try {
    const updateStatus = {
      $set: request.body.form,
    };
    const res = await jobSchema.updateOne(
      { jobId: request.body.jobId },
      updateStatus
    );
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
      { alumniId: 1 }
    );
    const jobData = await jobSchema.find({
      $and: [{ alumniId: alumniObj.alumniId }, { status: true }],
    });

    response.status(200).json( {
      jobData: jobData.reverse(),
      message: message.JOB_UPDATED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error while alumni job update controller", error);
    return response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniAddForumTopicController = async (request, response) => {
  try {
    response.render("alumniAddForum", { message: "", status: status.SUCCESS });
  } catch (error) {
    console.log("error while alumni add froum topics controller", error);
  }
};
export const alumniAddForumController = async (request, response) => {
  try {
    request.body.forumId = uuid4();
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
  
    );
    request.body.alumniId = alumniObj.alumniId;
    request.body.username = alumniObj.username;
    const res = await forumSchema.create(request.body);
    response.status(201).json( {
      message: message.FORUM_ADDED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error while alumni add forum controller", error);
    response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniViewMyForumController = async (request, response) => {
  try {
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
      { alumniId: 1 }
    );
    const forumData = await forumSchema.find({
      alumniId: alumniObj.alumniId,
      status: true,
    });
    response.status(200).json( {
      forumData: forumData.reverse(),
      message: "",
      status: status.SUCCESS,
    })
  } catch (error) {
    console.log("error while alumni view my forum", error);
    response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniViewAllForumController = async (request, response) => {
  try {
    const alumniObj = await alumniSchema.findOne(
      { email: request.payload.email },
      { alumniId: 1 }
    );
    const alumniId = alumniObj.alumniId;
    const forumData = await forumSchema.find({ status: true });
    const forumMemberArray = await forumMemberSchema.find();
    for (var i = 0; i < forumData.length; i++) {
      for (var j = 0; j < forumMemberArray.length; j++) {
        if (
          forumMemberArray[j].forumId == forumData[i].forumId &&
          forumMemberArray[j].alumniId == alumniId
        ) {
          forumData[i].messageStatus = "Send Message";
        }
      }
    }
    response.status(200).json({
      forumData: forumData.reverse(),
      message: "",
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("Error while alumnni view all forum controller", error);
    response.status(500).json({
      forumData: [],
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
// export const alumniUpdateForumController = async (request, response) => {
//   try {
//     const forumId = request.body.forumId;
//     const forumData = await forumSchema.findOne({ forumId });
//     response.render("alumniUpdateForum", {
//       forumData: forumData.reverse(),
//       email: request.payload.email,
//       message: "",
//       status: status.SUCCESS,
//     });
//   } catch (error) {
//     console.log("error while alumni update forum controller ", error);
//     const forumData = await forumSchema.find({ status: true });
//     response.render("alumniViewMyForum", {
//       forumData: forumData.reverse(),
//       email: request.payload.email,
//       message: message.SOMETHING_WENT_WRONG,
//       status: status.ERROR,
//     });
//   }
// };
export const alumniForumUpdateController = async (request, response) => {
  try {
    const forumId = request.body.forumId;
    // console.log(forumID)/;
    console.log(request.body);
    const updateStatus = {
      $set: request.body,
    };
    const updateData = await forumSchema.updateOne({ forumId }, updateStatus);
    // const forumData = await forumSchema.find({ status: true });
    response.status(200).json( {
      // forumData: forumData.reverse(),
      message: message.FORUM_UPDATED,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error while admin froum update controller", error);
    // const forumData = await forumSchema.find({ status: true });
    response.status(500).json( {
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const alumniDeleteForumController = async (request, response) => {
  try {
    const forumId = request.body.forumId;
    const status = {
      $set: {
        status: false,
      },
    };
    const res = await forumSchema.updateOne({ forumId }, status);
    response.status(200).json({
      success: true,
      message: message.FORUM_DELETED,
    });
  } catch (error) {
    console.log("error while admin froum delete controller", error);
    const forumData = await forumSchema.find({ status: true });
    response.status(500).json({
      success: false,
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};

export const alumniJoinForumController = async (request, response) => {
  try {
    const forumDetails = request.body.forumDetails;
    const forumId = forumDetails.forumId;
    const alumniObj = await alumniSchema.findOne(
      { email: request.payload.email },
      { alumniId: 1 }
    );
    const alumniId = alumniObj.alumniId;
    const checkForumMember = await forumMemberSchema.find({
      forumId,
      alumniId,
    });

    if (checkForumMember.length == 0) {
      const res = await forumMemberSchema.create({
        forumMemberId: uuid4(),
        forumId,
        alumniId,
      });

      if (res) {
        response.status(200).json({
          success: true,
          message: "Successfully joined the forum",
          status: status.SUCCESS,
        });
      } else {
        response.status(500).json({
          success: false,
          message: "Failed to join forum",
          status: status.ERROR,
        });
      }
    } else {
      response.status(200).json({
        success: true,
        message: "Already a member of this forum",
        status: status.SUCCESS,
      });
    }
  } catch (error) {
    console.log("Error while alumni join forum controller", error);
    response.status(500).json({
      success: false,
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
};
export const AlumniViewForumChatController = async (request, response) => { 
  try {
    const details = request.body.forumDetails;
    const forumDetails = details;
    const forumId = forumDetails.forumId;
    const alumniObj = await alumniSchema.findOne(
      { email: request.payload.email },
      { alumniId: 1 }
    );
    const alumniId = alumniObj.alumniId;
    const checkForumMember = await forumMemberSchema.find({
      forumId,
      alumniId,
    });
    const chatData = await forumChatSchema.find({
      forumId: forumDetails.forumId,
    });

    const specificForumIdArray = await forumMemberSchema.find({ forumId });
    const totalForumMember = specificForumIdArray.length;
    
    // Get forum members data for sidebar
    const forumMembers = await alumniSchema.find(
      { alumniId: { $in: specificForumIdArray.map(member => member.alumniId) } },
      { alumniId: 1, username: 1, email: 1, currentCompany: 1, designation: 1, stream: 1, branch: 1, passOutYear: 1, profile: 1 }
    ).lean();
    
    // Map the data properly
    const mappedMembers = forumMembers.map(member => ({
      alumniId: member.alumniId,
      alumniName: member.username,
      name: member.username,
      email: member.email,
      currentCompany: member.currentCompany,
      designation: member.designation,
      stream: member.stream,
      branch: member.branch,
      passOutYear: member.passOutYear,
      profile: member.profile
    }));
    
    if (checkForumMember.length == 0) {
      const res = await forumMemberSchema.create({
        forumMemberId: uuid4(),
        forumId,
        alumniId,
      });

      if (res) {
        response.status(200).json({
          chatData,
          forumDetails,
          myId: alumniObj.alumniId,
          totalForumMember: totalForumMember + 1, // Include the newly added member
          forumMembers: [...mappedMembers, {
            alumniId: alumniObj.alumniId,
            alumniName: alumniObj.username || 'Unknown',
            name: alumniObj.username || 'Unknown'
          }],
          email: request.payload.email,
          message: "",
          status: status.SUCCESS,
        });
      } else {
        response.status(500).json({
          success: false,
          message: "Failed to join forum",
          status: status.ERROR
        });
      }
    } else {
      response.status(200).json({
        chatData,
        forumDetails,
        myId: alumniObj.alumniId,
        totalForumMember,
        forumMembers: mappedMembers,
        email: request.payload.email,
        message: "",
        status: status.SUCCESS,
      });
    }
  } catch (error) {
    console.log("Error while alumni view forum chat controller", error);
    response.status(500).json({
      success: false,
      message: "Something went wrong",
      status: status.ERROR,
    });
  }
};
export const alumniForumChatController = async (request, response) => {
  try {
    const forumDetails = request.body.forumDetails;
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email }
    );
    
    const obj = {
      forumChatId: uuid4(),
      message: request.body.message,
      forumId: forumDetails.forumId,
      alumniId: alumniObj.alumniId,
      alumniName: alumniObj.username,
      profile: alumniObj.profile
    };
    
    const result = await forumChatSchema.create(obj);
    const chatData = await forumChatSchema.find({
      forumId: forumDetails.forumId,
    });
    
    const specificForumIdArray = await forumMemberSchema.find({ forumId: forumDetails.forumId });
    const totalForumMember = specificForumIdArray.length;
    
    // Get forum members data for sidebar
    const forumMembers = await alumniSchema.find(
      { alumniId: { $in: specificForumIdArray.map(member => member.alumniId) } },
      { alumniId: 1, username: 1, email: 1, currentCompany: 1, designation: 1, stream: 1, branch: 1, passOutYear: 1, profile: 1 }
    ).lean();
    
    // Map the data properly
    const mappedMembers = forumMembers.map(member => ({
      alumniId: member.alumniId,
      alumniName: member.username,
      name: member.username,
      email: member.email,
      currentCompany: member.currentCompany,
      designation: member.designation,
      stream: member.stream,
      branch: member.branch,
      passOutYear: member.passOutYear,
      profile: member.profile
    }));
    
    // Emit socket event for real-time chat
    try {
      const io = getIO();
      const newChatMessage = {
        forumChatId: obj.forumChatId,
        message: obj.message,
        forumId: obj.forumId,
        alumniId: obj.alumniId,
        alumniName: obj.alumniName,
        profile: obj.profile,
        sentTime: result.sentTime,
        sentDate: result.sentDate
      };
      
      // Emit to all users in the forum room
      io.to(`forum:${forumDetails.forumId}`).emit('forum:newMessage', {
        forumId: forumDetails.forumId,
        chat: newChatMessage
      });
      
      console.log(`Message emitted to forum:${forumDetails.forumId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Don't fail the request if socket fails
    }
    
    response.status(200).json({
      message: "Message sent successfully",
      status: 200,
      chatData: chatData,
      totalForumMember: totalForumMember,
      forumMembers: mappedMembers,
      success: true,
      alumniName: alumniObj.username
    });
  } catch (error) {
    console.log("Error in Alumni forum chat controller", error);
    response.status(500).json({
      message: "Failed to send message",
      success: false,
    });
  }
};
export const alumniViewEventsController = async (request, response) => {
  try {
    const eventData = await eventSchema.find({
      status: true, eventEndDate: {
        $gte: moment().format('YYYY-MM-DD')
      }
    });
    const eventInvitationData = await eventConfirmationSchema.find({ status: true });
    const alumniObj = await alumniSchema.findOne(
      { email: request.payload.email },
      { alumniId: 1 }
    );
    
    if (!alumniObj) {
      return response.status(401).json({
        events: [],
        message: 'Alumni not found',
        status: status.ERROR
      });
    }
    
    const alumniId = alumniObj.alumniId;
    
    // Set button messages based on invitation status
    if (eventData && eventData.length > 0) {
      for (var i = 0; i < eventData.length; i++) {
        // Check if this alumni has accepted this event
        const hasAccepted = eventInvitationData && eventInvitationData.length > 0 && eventInvitationData.some(invitation => 
          invitation.eventId == eventData[i].eventId && 
          invitation.alumniId == alumniId
        );
        
        if (hasAccepted) {
          eventData[i].inviteBTNMessage = 'Decline'; // Show decline button after acceptance
        } else {
          eventData[i].inviteBTNMessage = 'Accept Invitation'; // Show accept button by default
        }
      }
    }
    
    response.status(200).json({
      events: eventData ? eventData.reverse() : [],
      message: '',
      status: status.SUCCESS
    });
  } catch (error) {
    console.log("error in alumniViewEventsController", error);
    response.status(500).json({
      events: [],
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR
    });
  }
}
export const alumniAcceptInvitationController = async (request, response) => {
  try {
    const eventId = request.body.eventObj.eventId;
    const eventName = request.body.eventObj.eventName;
    console.log("eventId", eventId);
    console.log("email", request.body.email);
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
      { alumniId: 1, username: 1 }
    );
    console.log("alumniObj", alumniObj);
    
    if (!alumniObj) {
      return response.status(401).json({
        message: 'Alumni not found',
        status: status.ERROR
      });
    }
    
    const alumniId = alumniObj.alumniId;
    const alumniName = alumniObj.username;
    var eventStatus = true;
    const eventInvitationDataUpdate = await eventConfirmationSchema.updateOne({ eventId, alumniId }, { status: true });
    const eventInvitationData = await eventConfirmationSchema.find({ status: true });
    
    if (eventInvitationData && eventInvitationData.length > 0) {
      for (var i = 0; i < eventInvitationData.length; i++) {
        if (eventInvitationData[i].alumniId == alumniId && eventInvitationData[i].eventId == eventId) {
          eventStatus = false;
          break;
        }
      }
    }
    
    if (eventStatus) {
      const obj = {
        eventConfirmationId: uuid4(),
        eventId,
        eventName,
        alumniId,
        alumniName
      }
      const res = await eventConfirmationSchema.create(obj);
    }
    const eventInvitationData2 = await eventConfirmationSchema.find({ status: true });
    const eventData = await eventSchema.find({
      status: true, eventEndDate: {
        $gte: moment().format('YYYY-MM-DD')
      }
    });
    console.log("eventInvitationData2",eventInvitationData2);

    // Set button messages based on invitation status
    if (eventData && eventData.length > 0) {
      for (var i = 0; i < eventData.length; i++) {
        // Check if this alumni has accepted this event
        const hasAccepted = eventInvitationData2 && eventInvitationData2.length > 0 && eventInvitationData2.some(invitation => 
          invitation.eventId == eventData[i].eventId && 
          invitation.alumniId == alumniId
        );
        
        if (hasAccepted) {
          eventData[i].inviteBTNMessage = 'Decline'; // Show decline button after acceptance
        } else {
          eventData[i].inviteBTNMessage = 'Accept Invitation'; // Show accept button by default
        }
      }
    }
    
    if (eventStatus) {
      response.status(200).json({
        eventData: eventData ? eventData.reverse() : [],
        message: 'Invitation Accepted',
        status: status.SUCCESS,
      });
    } else {
      response.status(201).json({
        message: message.INVITATION_ALREADY_ACCEPTED,
        status: status.ERROR,
    });
    }
  } catch (error) {
    console.log("error in alumniAcceptInvitationController", error);
    response.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
}
export const alumniDeclainInvitationController = async (request, response) => {
  try {
    const eventId = request.body.eventObj.eventId;
    console.log("eventId", eventId);
    console.log("email", request.body.email);
    const alumniObj = await alumniSchema.findOne(
      { email: request.body.email },
      { alumniId: 1, username: 1 }
    );
    console.log("alumniObj", alumniObj);
    
    if (!alumniObj) {
      return response.status(401).json({
        message: 'Alumni not found',
        status: status.ERROR
      });
    }
    
    const alumniId = alumniObj.alumniId;
    
    // Update the event confirmation status to false (declined)
    const updateResult = await eventConfirmationSchema.updateOne({ eventId, alumniId }, { status: false });
    
    // Get all accepted invitations
    const eventInvitationData = await eventConfirmationSchema.find({ status: true });
    
    // Get all active events
    const eventData = await eventSchema.find({
      status: true, eventEndDate: {
        $gte: moment().format('YYYY-MM-DD')
      }
    });

    // Set button messages based on invitation status
    if (eventData && eventData.length > 0) {
      for (var i = 0; i < eventData.length; i++) {
        // Check if this alumni has accepted this event
        const hasAccepted = eventInvitationData && eventInvitationData.length > 0 && eventInvitationData.some(invitation => 
          invitation.eventId == eventData[i].eventId && 
          invitation.alumniId == alumniId
        );
        
        if (hasAccepted) {
          eventData[i].inviteBTNMessage = 'Decline'; // Show decline button after acceptance
        } else {
          eventData[i].inviteBTNMessage = 'Accept Invitation'; // Show accept button by default
        }
      }
    }

    response.status(200).json({
      eventData: eventData ? eventData.reverse() : [],
      message: 'Invitation Declined',
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error in alumniDeclainInvitationController", error);
    response.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
}
export const alumniViewGalleryController = async (request, response) => {
  try {
    const galleryData = await gallerySchema.find({ status: true });
    console.log('Raw gallery data:', galleryData);
    
    // Process each gallery item to add eventName
    const processedGalleryData = await Promise.all(
      galleryData.map(async (galleryItem) => {
        try {
          const eventObj = await eventSchema.findOne({ eventId: galleryItem.eventId });
          
          return {
            ...galleryItem.toObject(), // Convert mongoose document to plain object
            eventName: eventObj ? eventObj.eventName : 'Unknown Event'
          };
        } catch (error) {
          console.log('Error processing gallery item:', error);
          return {
            ...galleryItem.toObject(),
            eventName: 'Unknown Event'
          };
        }
      })
    );
    
    console.log('Processed gallery data with event names:', processedGalleryData);
    
    response.status(200).json({
      galleryData: processedGalleryData ? processedGalleryData.reverse() : [],
      message: '',
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error in alumniViewGalleryController", error);
    response.status(500).json({
      galleryData: [],
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
}
export const alumniLogoutController = async (request, response) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';

    response.clearCookie('alumni_jwt', {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      secure: isProd,
    });

    // Also clear any session data
    if (request.session) {
      request.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    response.status(200).json({
      message: message.LOGOUT_SUCCESSFULL,
      status: status.SUCCESS,
    });
  } catch (error) {
    console.log("error in alumniLogoutController", error);
    response.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      status: status.ERROR,
    });
  }
}