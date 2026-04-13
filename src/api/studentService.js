import API from './axios';

const studentService = {
    // Dashboard - consolidated data
    getDashboard: (id) => API.get(`/student/${id}/dashboard`),

    // Profile is treated as the main dashboard data source for student
    getProfile: (id) => API.get(`/student/${id}/profile`),

    // Specific modules
    getBatch: (id) => API.get(`/student/${id}/batch`),

    // Updated endpoint matching backend
    getUpcomingEvents: () => API.get('/student/events/upcoming'),

    getScheduleByBatch: (batchId) => API.get(`/schedule/batch/${batchId}`),

    getFees: (id) => API.get(`/student/${id}/fees`),

    updateProfile: (id, data) => API.put(`/student/${id}/profile`, data),
    // 💃 Wedding Choreography
    getSangeetPackages: () => API.get('/student/sangeet'),
    getSangeetSettings: () => API.get('/admin/sangeet/settings'),
    bookSangeetPackage: (data) => API.post('/student/sangeet/book', data),
    uploadSangeetReceipt: (inquiryId, formData) => API.post(`/student/sangeet/${inquiryId}/upload-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMySangeetInquiries: (studentId) => API.get(`/student/sangeet/${studentId}/my-inquiries`),

    getMyBookedEvents: (studentId) => API.get(`/student/events/${studentId}/booked`),
    getMyEventInquiries: (studentId) => API.get(`/student/events/${studentId}/inquiries`),
    submitEventInquiry: (data) => API.post('/student/events/enquire', data),
    uploadEventReceipt: (inquiryId, formData) => API.post(`/student/events/inquiry/${inquiryId}/upload-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    cancelEventBooking: (eventId, studentId) => API.delete(`/student/events/${eventId}/cancel/${studentId}`),

    checkIn: (id) => API.post(`/student/${id}/check-in`),
    uploadProfilePic: (id, formData) => API.post(`/student/${id}/upload-profile-pic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadRegistrationFee: (studentId, formData) => API.post(`/admin/student/${studentId}/upload-registration-fee`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 📚 Batch Enrollment
    getAvailableBatches: () => API.get('/student/batch/available'),
    submitBatchInquiry: (data) => API.post('/student/batch/enroll', data),
    getMyBatchInquiries: (studentId) => API.get(`/student/batch/${studentId}/inquiries`),

    // 🔔 Notifications
    // 🔔 Notifications
    getNotifications: (studentId) => API.get(`/admin/notifications/student/${studentId}`),

    // 💰 Fee Settings
    // 💰 Fee Settings
    getPublicFeeSettings: () => API.get('/public/fee-settings'),
    getFeeStructure: () => API.get('/public/fee-structure'),

    // ℹ️ About Us
    getAboutUsData: () => API.get('/public/about-us'),

    // 🗓️ Holidays
    getUpcomingHolidays: (batchId) => {
        const url = batchId ? `/holidays/upcoming/batch/${batchId}` : '/holidays/upcoming';
        return API.get(url);
    },
};

export default studentService;
