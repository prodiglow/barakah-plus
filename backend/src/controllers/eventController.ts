import { Request, Response } from "express";
import { Event } from "../models/Event";
import { Order } from "../models/Orders";
import { sendEmail } from "../services/emailService";

// ➕ INSERT EVENT
export const insertEvent = async (req: Request, res: Response) => {
  try {
    const { eventTitle, description, eventLocation, eventDate, eventPic, eventSpecial, joiningLink, isFeatured, showOnHomePage, quranKhawaniDate, quranKhawaniTimeSlot, orderId } = req.body;

    if (!eventTitle || !description || !eventLocation || !eventDate || !eventPic || !eventSpecial || !joiningLink) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Event.findOne({ eventTitle });
    if (existing) {
      return res.status(409).json({ message: "Event with this Title already exists" });
    }

    const event = new Event({
      eventTitle,
      eventSpecial,
      description,
      eventLocation,
      eventDate,
      eventPic,
      joiningLink,
      isFeatured: isFeatured || false,
      showOnHomePage: showOnHomePage || false,
      quranKhawaniDate,
      quranKhawaniTimeSlot,
      orderId,
    });

    await event.save();

    // If orderId is provided, mark the order as event-created and send email
    if (orderId) {
      try {
        const order = await Order.findByIdAndUpdate(orderId, { isEventCreated: true }).populate("UserID");
        console.log(`✅ Order ${orderId} marked as event-created.`);

        if (order && order.UserID) {
          const user: any = order.UserID;
          if (user.email) {
            const subject = "Your Quran Khawani Event is Ready to Join!";
            const text = "Your Quran Khawani event has been created. Please join on time and share with family and friends to join Quran Khawani.";
            
            const displayDate = quranKhawaniDate && quranKhawaniTimeSlot 
              ? `${quranKhawaniDate} - ${quranKhawaniTimeSlot}` 
              : new Date(eventDate).toLocaleString();

            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #006c3b; padding: 20px; text-align: center;">
                  <h2 style="color: white; margin: 0;">Baraka Plus</h2>
                </div>
                <div style="padding: 20px; background-color: #ffffff;">
                  <h3 style="color: #333; margin-top: 0;">Quran Khawani Event Created</h3>
                  <p style="color: #555; line-height: 1.6; font-size: 16px;">
                    Dear ${order.name || user.name || 'User'},
                  </p>
                  <p style="color: #555; line-height: 1.6; font-size: 16px;">
                    Your Quran Khawani event has been created. Please join on time and share with family and friend to join Quran Khawani.
                  </p>
                  
                  <div style="background-color: #f0faf5; padding: 15px; border-radius: 5px; margin: 25px 0; border: 1px solid #a5d6b7;">
                    <p style="margin: 5px 0; color: #1b5e20; font-size: 15px;"><strong>Event Title:</strong> ${eventTitle}</p>
                    <p style="margin: 5px 0; color: #1b5e20; font-size: 15px;"><strong>Date & Time:</strong> ${displayDate}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${joiningLink}" style="background-color: #F69320; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Join Quran Khawani
                    </a>
                  </div>
                  
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Baraka Plus. All rights reserved.
                  </p>
                </div>
              </div>
            `;
            await sendEmail(user.email, subject, text, html);
            console.log(`✉️ Email securely sent to ${user.email} for Quran Khawani event.`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to update order or send email for ${orderId}:`, err);
      }
    }

    res.status(201).json({ message: "✅ Event created successfully", event });
  } catch (error) {
    console.error("Error inserting event:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📋 GET ALL EVENTS (with participants populated)
export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .sort({ eventDate: 1 })
      .populate({
        path: "participants", // field name in Event model
        select: "name email profileImg", // select specific fields from User
      });

    res.status(200).json({
      message: "✅ Events fetched successfully",
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔍 GET EVENT BY ID (with participants populated)
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate({
      path: "participants",
      select: "name email profileImg", // adjust based on your User schema
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "✅ Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✏️ UPDATE EVENT
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Explicitly select fields to update to prevent _id/immutable field modification errors
    const { eventTitle, description, eventLocation, eventDate, eventPic, eventSpecial, joiningLink, isFeatured, showOnHomePage, quranKhawaniDate, quranKhawaniTimeSlot } = req.body;

    const updates: any = {};
    if (eventTitle !== undefined) updates.eventTitle = eventTitle;
    if (description !== undefined) updates.description = description;
    if (eventLocation !== undefined) updates.eventLocation = eventLocation;
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (eventPic !== undefined) updates.eventPic = eventPic;
    if (eventSpecial !== undefined) updates.eventSpecial = eventSpecial;
    if (joiningLink !== undefined) updates.joiningLink = joiningLink;
    if (quranKhawaniDate !== undefined) updates.quranKhawaniDate = quranKhawaniDate;
    if (quranKhawaniTimeSlot !== undefined) updates.quranKhawaniTimeSlot = quranKhawaniTimeSlot;
    
    if (isFeatured !== undefined) {
         if (typeof isFeatured === 'string') {
             updates.isFeatured = isFeatured === 'true';
         } else {
             updates.isFeatured = isFeatured;
         }
    } 

    if (showOnHomePage !== undefined) {
         if (typeof showOnHomePage === 'string') {
             updates.showOnHomePage = showOnHomePage === 'true';
         } else {
             updates.showOnHomePage = showOnHomePage;
         }
    } 

    const event = await Event.findByIdAndUpdate(id, updates, { new: true }).populate({
      path: "participants",
      select: "name email profileImg",
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "✅ Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ❌ DELETE EVENT
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // If this event is linked to an order, reset the order's created flag
    if (event.orderId) {
      try {
        await Order.findByIdAndUpdate(event.orderId, { isEventCreated: false });
        console.log(`🔄 Order ${event.orderId} isEventCreated reset to false due to event deletion.`);
      } catch (err) {
        console.error(`❌ Failed to reset order ${event.orderId}:`, err);
      }
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({ message: "🗑️ Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
