import mongoose from 'mongoose';

// Unified store for every miscellaneous customer-facing form on the storefront
// (Contact Us, Support tickets, Career applications, Replacement requests).
// Each form type shares the same core fields (name/email/phone/subject/message)
// and stashes its own extra fields in `meta` so new form fields don't require
// a schema migration.
const formSubmissionSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      enum: ['Contact', 'Support', 'Career', 'Replacement'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Form-specific extra data, e.g.
    //   Career:      { position, experience, resumeUrl }
    //   Replacement: { orderId, productName, reason, imageUrl }
    //   Support:     { orderId, category }
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Populated only if the submitter was logged in at the time.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    adminReply: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

formSubmissionSchema.index({ formType: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ createdAt: -1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;
