import mongoose, { Document, Schema } from 'mongoose';

export interface IServerConfig extends Document {
  serverId: string;
  voiceChannels: string[];
  temporaryChannels: string[];
}

const ServerConfigSchema: Schema = new Schema({
  serverId: { type: String, required: true, unique: true },
  voiceChannels: [{ type: String }],
  temporaryChannels: [{ type: String }],
});

export const ServerConfig = mongoose.model<IServerConfig>('ServerConfig', ServerConfigSchema);
