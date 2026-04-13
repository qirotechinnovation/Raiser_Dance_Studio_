import API from './axios';

const studioService = {
    // Student
    createBooking: (data) => API.post('/studio/book', data),
    getMyBookings: (studentId) => API.get(`/studio/my-bookings/${studentId}`),
    uploadPayment: (bookingId, formData) => API.post(`/studio/${bookingId}/upload-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Admin
    getAllBookings: () => API.get('/studio/all'),
    updateStatus: (id, status, remarks) => API.put(`/studio/${id}/status`, { status, remarks }),

    // Admin CRUD
    adminCreateBooking: (data) => API.post('/studio/admin/book', data),
    adminUpdateBooking: (id, data) => API.put(`/studio/admin/${id}`, data),
    deleteBooking: (id) => API.delete(`/studio/admin/${id}`),
};

export default studioService;
