// src/config/rate-limits.ts

export interface RateLimitConfig {
  hourly: number;
  daily: number;
}

export interface AppRateLimits {
  midiGeneration: RateLimitConfig;
  iteration: RateLimitConfig;
  accountCreation: RateLimitConfig; // IP-based
  // Add other action types as needed
}

// Default values, ideally overridden by environment variables
const defaults: AppRateLimits = {
  midiGeneration: {
    hourly: parseInt(process.env.MIDI_GEN_HOURLY_LIMIT_PER_USER || "100"),
    daily: parseInt(process.env.MIDI_GEN_DAILY_LIMIT_PER_USER || "1000"),
  },
  iteration: {
    hourly: parseInt(process.env.ITERATION_HOURLY_LIMIT_PER_USER || "200"),
    daily: parseInt(process.env.ITERATION_DAILY_LIMIT_PER_USER || "2000"),
  },
  accountCreation: { // This is per IP
    hourly: parseInt(process.env.ACCOUNT_CREATION_HOURLY_LIMIT_PER_IP || "5"),
    daily: parseInt(process.env.ACCOUNT_CREATION_DAILY_LIMIT_PER_IP || "10"),
  },
};

export function getRateLimits(): AppRateLimits {
  // In a real app, you might have more sophisticated config loading
  return defaults;
}

export const rateLimitConfigs = getRateLimits();

// Define action types for clarity
export enum ActionType {
  MidiGeneration = "midiGeneration",
  Iteration = "iteration",
  AccountCreation = "accountCreation",
  LoginAttempt = "loginAttempt", // For detecting suspicious login activity
}
