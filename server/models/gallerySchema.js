import moment from "moment";
import mongoose from "mongoose";
const gallerySchema=mongoose.Schema({
    galleryId:{
        type:String,
        required:true
    },
    eventId:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required:true
    },
    uploadDate:{
        type:String,
        default:()=>moment().format('DD/MM/YYYY')
    }
    ,
    uploadTime:{
        type:String,
        default:()=>moment().format('hh:mm:ss A')
    },
    status:{
        type:String,
        default:true
    }
});
export default mongoose.model('gallerySchema',gallerySchema,'gallery');