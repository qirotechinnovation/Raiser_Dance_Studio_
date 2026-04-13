import API from './axios';

/**
 * Admin Service - Central API for all Studio Management Modules
 */
const adminService = {
    // 📊 Dashboard Analytics
    getDashboard: (adminId) => API.get('/admin/dashboard', { params: { adminId } }),

    // 👨‍🎓 Student Management
    getStudents: () => API.get('/admin/students'),
    getStudentById: (id) => API.get(`/admin/students/${id}`),
    addStudent: (data) => API.post('/admin/students', data),
    updateStudent: (id, data) => API.put(`/admin/students/${id}`, data),
    deleteStudent: (id) => API.delete(`/admin/students/${id}`),
    getStudentsByBatch: (batchId) => API.get(`/admin/students/batch/${batchId}`),

    // 📝 Attendance Module
    saveAttendance: (records) => API.post('/admin/attendance/bulk', records),
    getAttendanceByBatch: (batchId) => API.get(`/admin/attendance/batch/${batchId}`),
    getAttendanceByBatchAndDate: (batchId, date) => API.get(`/admin/attendance/batch/${batchId}/date/${date}`),
    getAttendanceByBatchAndMonth: (batchId, year, month) => API.get(`/admin/attendance/batch/${batchId}/month/${year}/${month}`),
    updateAttendance: (id, data) => API.put(`/admin/attendance/${id}`, data),
    deleteAttendance: (id) => API.delete(`/admin/attendance/${id}`),
    getAttendance: () => API.get('/admin/attendance'),

    // 📅 Batch Management
    getBatches: () => API.get('/admin/batches'),
    getBatchesByStatus: (status) => API.get(`/admin/batches/status/${status}`),
    createBatch: (data) => API.post('/admin/batches', data),
    updateBatch: (id, data) => API.put(`/admin/batches/${id}`, data),
    deleteBatch: (id) => API.delete(`/admin/batches/${id}`),
    deactivateBatch: (id) => API.put(`/admin/batches/${id}/deactivate`),
    getBatchInquiries: () => API.get('/admin/batches/inquiries'),
    approveBatchInquiry: (id) => API.post(`/admin/batches/inquiry/${id}/approve`),
    rejectBatchInquiry: (id) => API.post(`/admin/batches/inquiry/${id}/reject`),

    // 💃 Dance Types & Skill Levels
    getDanceTypes: () => API.get('/admin/dance-types'),
    createDanceType: (data) => API.post('/admin/dance-types', data),
    updateDanceType: (id, data) => API.put(`/admin/dance-types/${id}`, data),
    deleteDanceType: (id) => API.delete(`/admin/dance-types/${id}`),

    getSkillLevels: () => API.get('/admin/skill-levels'),
    createSkillLevel: (data) => API.post('/admin/skill-levels', data),
    updateSkillLevel: (id, data) => API.put(`/admin/skill-levels/${id}`, data),
    deleteSkillLevel: (id) => API.delete(`/admin/skill-levels/${id}`),

    // 💰 Fee Management & Global Settings
    getPendingFees: () => API.get('/admin/fees/pending'),
    getAllFees: () => API.get('/admin/fees'),
    getFeeById: (id) => API.get(`/admin/fees/${id}`),
    addFee: (studentId, data) => API.post(`/admin/fees/student/${studentId}`, data),
    collectFee: (data) => API.post('/admin/fees/collect', data),
    updateFee: (id, data) => API.put(`/admin/fees/${id}`, data),
    deleteFee: (id) => API.delete(`/admin/fees/${id}`),
    getStudentFees: (studentId) => API.get(`/admin/fees/student/${studentId}`),
    markFeePaid: (id, mode, transId, remarks) => API.put(`/admin/fees/${id}/pay`, null, { params: { paymentMode: mode, transactionId: transId, remarks: remarks } }),
    sendFeeReminder: (id) => API.post(`/admin/fees/${id}/remind`),
    getReminders: () => API.get('/admin/reminders'),

    getFeeSettings: () => API.get('/admin/fee-settings'),
    updateFeeSettings: (data) => API.put('/admin/fee-settings', data),

    getFeeStructure: () => API.get('/admin/fee-structure'),
    createFeeStructure: (data) => API.post('/admin/fee-structure', data),
    updateFeeStructure: (id, data) => API.put(`/admin/fee-structure/${id}`, data),
    deleteFeeStructure: (id) => API.delete(`/admin/fee-structure/${id}`),

    getPublicFeeSettings: () => API.get('/public/fee-settings'),

    // 🎭 Events Module
    getEvents: () => API.get('/admin/events'),
    createEvent: (data) => API.post('/admin/events', data),
    updateEvent: (id, data) => API.put(`/admin/events/${id}`, data),
    deleteEvent: (id) => API.delete(`/admin/events/${id}`),
    addParticipants: (eventId, studentIds) => API.post(`/admin/events/${eventId}/participants`, studentIds),
    uploadEventPhoto: (eventId, formData) => API.post(`/admin/events/${eventId}/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllEventInquiries: () => API.get('/admin/events/inquiries'),
    updateEventInquiryStatus: (id, status) => API.put(`/admin/events/inquiry/${id}/status`, null, { params: { status } }),

    // 💍 Wedding Choreography Module
    getSangeetPackages: () => API.get('/admin/sangeet/packages'),
    createSangeetPackage: (data) => API.post('/admin/sangeet/packages', data),
    updateSangeetPackage: (id, data) => API.put(`/admin/sangeet/packages/${id}`, data),
    deleteSangeetPackage: (id) => API.delete(`/admin/sangeet/packages/${id}`),

    getSangeetInquiries: () => API.get('/admin/sangeet/inquiries'),
    updateInquiryStatus: (id, status) => API.put(`/admin/sangeet/inquiries/${id}/status`, null, { params: { status } }),
    updateSangeetInquiry: (id, data) => API.put(`/admin/sangeet/inquiries/${id}`, data),
    deleteSangeetInquiry: (id) => API.delete(`/admin/sangeet/inquiries/${id}`),
    acceptSangeetInquiry: (id) => API.put(`/admin/sangeet/inquiries/${id}/accept`),
    declineSangeetInquiry: (id) => API.put(`/admin/sangeet/inquiries/${id}/decline`),
    confirmSangeetPayment: (id) => API.post(`/admin/sangeet/inquiries/${id}/confirm-payment`),

    getSangeetSettings: () => API.get('/admin/sangeet/settings'),
    updateSangeetSettings: (data) => API.put('/admin/sangeet/settings', data),

    // 🛡️ Auth/Admin Registration
    registerAdmin: (data) => API.post('/auth/register/admin', data),
    getNewRegistrations: () => API.get('/auth/new-registrations'),
    getAdminProfile: (id) => API.get(`/admin/${id}/profile`),
    uploadAdminProfilePic: (id, formData) => API.post(`/admin/${id}/upload-profile-pic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getUsers: () => API.get('/admin/users'),

    // 🔔 Notifications
    getNotifications: () => API.get('/admin/notifications'),
    getUnreadNotifications: () => API.get('/admin/notifications/unread'),
    markNotificationRead: (id) => API.put(`/admin/notifications/${id}/read`),
    clearAllNotifications: () => API.delete('/admin/notifications/clear-all'), // New method
    approveActivation: (id) => API.post(`/admin/notifications/${id}/approve`),
    rejectActivation: (id) => API.post(`/admin/notifications/${id}/reject`),

    // 🏫 Studio Inquiries (Walk-ins)
    getStudioInquiries: () => API.get('/admin/inquiries'),
    createStudioInquiry: (data) => API.post('/admin/inquiries', data),
    updateStudioInquiryStatus: (id, status) => API.put(`/admin/inquiries/${id}/status`, null, { params: { status } }),
    deleteStudioInquiry: (id) => API.delete(`/admin/inquiries/${id}`),

    // 🎓 Metadata
    getSkillLevels: () => API.get('/admin/skill-levels'),

    // ℹ️ About Us Management
    getAboutUsSettings: () => API.get('/admin/about-us/settings'),
    updateAboutUsSettings: (data) => API.put('/admin/about-us/settings', data),
    uploadAboutUsImage: (imageNumber, formData) => API.post(`/admin/about-us/upload-image/${imageNumber}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 💎 Core Values
    getCoreValues: () => API.get('/admin/about-us/values'),
    createCoreValue: (data) => API.post('/admin/about-us/values', data),
    updateCoreValue: (id, data) => API.put(`/admin/about-us/values/${id}`, data),
    deleteCoreValue: (id) => API.delete(`/admin/about-us/values/${id}`),

    // 🖼️ Event Gallery Endpoints
    getGalleryItems: () => API.get('/admin/about-us/gallery'),
    uploadGalleryItem: (formData) => API.post('/admin/about-us/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateGalleryItem: (id, eventName, description, category, displayOrder) => API.put(`/admin/about-us/gallery/${id}`, null, {
        params: { eventName, description, category, displayOrder }
    }),
    deleteGalleryItem: (id) => API.delete(`/admin/about-us/gallery/${id}`),

    // 🗓️ Holiday Management
    getHolidays: () => API.get('/holidays/upcoming'),
    createHoliday: (data) => API.post('/holidays', data),
    updateHoliday: (id, data) => API.put(`/holidays/${id}`, data),
    deleteHoliday: (id) => API.delete(`/holidays/${id}`),

    // 📅 Weekly Schedule
    getAllSchedules: () => API.get('/schedule/all'),
    getSchedulesByBatch: (batchId) => API.get(`/schedule/batch/${batchId}`),
    addScheduleSlot: (batchId, data) => API.post(`/schedule/batch/${batchId}`, data),
    deleteScheduleSlot: (id) => API.delete(`/schedule/${id}`),
    syncAllSchedules: () => API.post('/admin/batches/sync-all-schedules'),
};

export default adminService;
