import asyncHandler from "../../../middleware/asyncHandler.js";
import Ticket from "../../../models/Ticket.js";

// @desc    Get all tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
export const getTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({})
        .populate("user", "name email mobile") // Assuming Customer has mobile
        .sort({ createdAt: -1 });
    res.json(tickets);
});

// @desc    Update ticket status/reply
// @route   PUT /api/admin/tickets/:id
// @access  Private/Admin
export const updateTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (ticket) {
        ticket.status = req.body.status || ticket.status;
        ticket.priority = req.body.priority || ticket.priority;
        ticket.adminReply = req.body.adminReply || ticket.adminReply;

        const updatedTicket = await ticket.save();
        res.json(updatedTicket);
    } else {
        res.status(404);
        throw new Error("Ticket not found");
    }
});

// @desc    Delete ticket
// @route   DELETE /api/admin/tickets/:id
// @access  Private/Admin
export const deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (ticket) {
        await Ticket.deleteOne({ _id: ticket._id });
        res.json({ message: "Ticket removed" });
    } else {
        res.status(404);
        throw new Error("Ticket not found");
    }
});
