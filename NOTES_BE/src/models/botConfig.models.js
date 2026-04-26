import mongoose from 'mongoose';

const BotConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    logChatId: { type: String, default: '' },
    startImage: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    adminIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const BotConfig = mongoose.model('BotConfig', BotConfigSchema);
