import api from './api';

export interface EventData {
    _id?: string;
    eventID?: number;
    eventTitle: string;
    eventSpecial: string;
    description: string;
    eventLocation: string;
    eventDate: Date | string;
    eventPic: string;
    joiningLink?: string;
    isFeatured: boolean;
    showOnHomePage: boolean;
    quranKhawaniDate?: string;
    quranKhawaniTimeSlot?: string;
    orderId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const getAllEvents = async (): Promise<{ events: EventData[], count: number }> => {
    const response = await api.get('/events');
    return response.data;
};

export const getEventById = async (id: string): Promise<EventData> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
};

export const createEvent = async (data: EventData): Promise<EventData> => {
    const response = await api.post('/events/insert', data);
    return response.data;
};

export const updateEvent = async (id: string, data: Partial<EventData>): Promise<EventData> => {
    const response = await api.put(`/events/update/${id}`, data);
    return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
    await api.delete(`/events/delete/${id}`);
};
