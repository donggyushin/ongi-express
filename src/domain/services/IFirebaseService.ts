export interface IFirebaseService {
  /**
   * Initialize Firebase Admin SDK
   */
  initialize(): Promise<void>;

  /**
   * Verify Firebase ID token
   * @param token - Firebase ID token
   * @returns Decoded token with user information
   */
  verifyIdToken(token: string): Promise<any>;

  /**
   * Send push notification to specific device
   * @param token - Device FCM token
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional custom data
   */
  sendToDevice(token: string, title: string, body: string, data?: Record<string, string>): Promise<void>;

  /**
   * Send push notification to multiple devices
   * @param tokens - Array of device FCM tokens
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional custom data
   */
  sendToMultipleDevices(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;

  /**
   * Send push notification to topic
   * @param topic - Topic name
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional custom data
   */
  sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
}