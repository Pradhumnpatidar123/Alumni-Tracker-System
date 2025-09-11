import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import reportWebVitals from './reportWebVitals';
import Login from './components/alumni/Login';
import AdminMain from './components/admin/AdminMain';
import Registration from './components/alumni/Registration';
import AdminHome from './components/admin/AdminHome';
import AboutLogin from './components/admin/AdminLogin';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminAlumniList from './components/admin/AdminAlumniList';
import AlumniMain from './components/alumni/AlumniMain';
import { AuthProvider } from './context/AuthContext';
import Home from './components/alumni/Home';
import VerifyEmail from './components/alumni/VerifyEmail';
import AlumniHome from './components/alumni/AlumniHome';
import JobForm from './components/alumni/JobForm';
import JobsList from './components/alumni/AlumniJobView';
import AdminAddEvent from './components/admin/AdminAddEvent';
import EventList from './components/admin/AdminViewEvents';
import AlumniEventList from './components/alumni/AlumniViewEvent';
import AlumniEventConfirmationList from './components/admin/AdminEventAlumniStatus';
import GalleryList from './components/alumni/GalleryList';
import AlumniAddForumTopic from './components/alumni/AddForum';
import AlumniMyForumList from './components/alumni/ViewMyForum';
import AlumniViewAllForum from './components/alumni/ViewAllForum';
import AlumniForumChat from './components/alumni/ForumChat';
import AdminJobsList from './components/admin/AdminViewJob';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AlumniMain />} >
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Registration />} />
            <Route path="/verifyEmail" element={<VerifyEmail />} />
            <Route element={<ProtectedRoute redirectTo="/login" />}>
              <Route path="alumnihome" element={<AlumniHome />} />
              <Route path='jobform' element={<JobForm />} />
              <Route path='alumniviewjob' element={<JobsList />} />
              <Route path='alumniViewEvents' element={<AlumniEventList />} />
              <Route path='gallery' element={<GalleryList/>}/>
              <Route path='addFourm' element={<AlumniAddForumTopic/>}/>
              <Route path='viewMyForum' element={<AlumniMyForumList/>}/>
              <Route path='viewAllForum' element={<AlumniViewAllForum/>}/>
              <Route path='join' element={<AlumniForumChat/>}/>
            </Route>
          </Route>

          <Route path="/admin" element={<AdminMain />} >
            <Route path='login' element={<AboutLogin />} />
            <Route element={<ProtectedRoute redirectTo="/admin/login" />}>
              <Route path="Adminhome" element={<AdminHome />} />
              <Route path="alumniList" element={<AdminAlumniList />} />
              <Route path="addEvent" element={<AdminAddEvent />} />
              <Route path="eventList" element={<EventList />} />
              <Route path="confirmationEventList" element={<AlumniEventConfirmationList />} />
              <Route path='viewJob'element={<AdminJobsList/>} />
              
            </Route>
          </Route>
          {/* Add other routes here as needed */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
