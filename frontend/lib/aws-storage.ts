import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const cognito = new AWS.CognitoIdentityServiceProvider();

// Table names from environment or defaults
const USERS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE || 'fundtracer-users';
const SETTINGS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_SETTINGS_TABLE || 'fundtracer-settings';
const SESSIONS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_SESSIONS_TABLE || 'fundtracer-sessions';

interface StorageUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  [key: string]: any;
}

interface StorageSettings {
  userId: string;
  theme?: string;
  notifications?: Record<string, boolean>;
  preferences?: Record<string, any>;
  [key: string]: any;
}

interface StorageSession {
  userId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * AWS Cloud Storage Service
 * Replaces localStorage with AWS DynamoDB and S3
 */
export const awsStorageService = {
  // ===== USER DATA MANAGEMENT =====
  
  /**
   * Save user data to DynamoDB
   */
  async saveUser(user: StorageUser): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Item: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number || '',
          is_staff: user.is_staff || false,
          is_superuser: user.is_superuser || false,
          ...user,
          updatedAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 day expiry
        },
      };
      await dynamodb.put(params).promise();
    } catch (error) {
      console.error('Error saving user to DynamoDB:', error);
      throw error;
    }
  },

  /**
   * Get user data from DynamoDB
   */
  async getUser(userId: string): Promise<StorageUser | null> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: { id: userId },
      };
      const result = await dynamodb.get(params).promise();
      return result.Item as StorageUser || null;
    } catch (error) {
      console.error('Error getting user from DynamoDB:', error);
      return null;
    }
  },

  /**
   * Delete user data from DynamoDB
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: { id: userId },
      };
      await dynamodb.delete(params).promise();
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
      throw error;
    }
  },

  // ===== SESSION MANAGEMENT =====

  /**
   * Save session tokens to DynamoDB
   */
  async saveSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number = 3600
  ): Promise<void> {
    try {
      const sessionId = `${userId}-${Date.now()}`;
      const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

      const params = {
        TableName: SESSIONS_TABLE,
        Item: {
          userId,
          sessionId,
          accessToken,
          refreshToken,
          expiresAt,
          createdAt: Math.floor(Date.now() / 1000),
          ttl: expiresAt + (24 * 60 * 60), // Keep for 24 hours after expiry
        },
      };
      await dynamodb.put(params).promise();
    } catch (error) {
      console.error('Error saving session to DynamoDB:', error);
      throw error;
    }
  },

  /**
   * Get active session for user
   */
  async getSession(userId: string): Promise<StorageSession | null> {
    try {
      const params = {
        TableName: SESSIONS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Most recent first
        Limit: 1,
      };
      const result = await dynamodb.query(params).promise();
      
      if (result.Items && result.Items.length > 0) {
        const session = result.Items[0] as StorageSession;
        // Check if session is still valid
        if (session.expiresAt > Math.floor(Date.now() / 1000)) {
          return session;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting session from DynamoDB:', error);
      return null;
    }
  },

  /**
   * Delete session
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    try {
      const params = {
        TableName: SESSIONS_TABLE,
        Key: {
          userId,
          sessionId,
        },
      };
      await dynamodb.delete(params).promise();
    } catch (error) {
      console.error('Error deleting session from DynamoDB:', error);
      throw error;
    }
  },

  // ===== SETTINGS & PREFERENCES =====

  /**
   * Save user settings/preferences to DynamoDB
   */
  async saveSettings(userId: string, settings: StorageSettings): Promise<void> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Item: {
          userId,
          ...settings,
          updatedAt: new Date().toISOString(),
        },
      };
      await dynamodb.put(params).promise();
    } catch (error) {
      console.error('Error saving settings to DynamoDB:', error);
      throw error;
    }
  },

  /**
   * Get user settings from DynamoDB
   */
  async getSettings(userId: string): Promise<StorageSettings | null> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Key: { userId },
      };
      const result = await dynamodb.get(params).promise();
      return result.Item as StorageSettings || null;
    } catch (error) {
      console.error('Error getting settings from DynamoDB:', error);
      return null;
    }
  },

  /**
   * Update specific setting
   */
  async updateSetting(userId: string, settingKey: string, value: any): Promise<void> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Key: { userId },
        UpdateExpression: `SET #key = :value, updatedAt = :now`,
        ExpressionAttributeNames: {
          '#key': settingKey,
        },
        ExpressionAttributeValues: {
          ':value': value,
          ':now': new Date().toISOString(),
        },
      };
      await dynamodb.update(params).promise();
    } catch (error) {
      console.error('Error updating setting in DynamoDB:', error);
      throw error;
    }
  },

  // ===== FILE UPLOAD TO S3 =====

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: File,
    path: string,
    userId?: string
  ): Promise<string> {
    try {
      const key = userId ? `${userId}/${path}` : path;
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'fundtracer-storage',
        Key: key,
        Body: file,
        ContentType: file.type,
        ACL: 'private' as any,
        Metadata: {
          uploadedAt: new Date().toISOString(),
          userId: userId || 'anonymous',
        },
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  },

  /**
   * Get signed URL for S3 file
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'fundtracer-storage',
        Key,
        Expires: expiresIn,
      };
      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('Error getting signed URL from S3:', error);
      throw error;
    }
  },

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'fundtracer-storage',
        Key,
      };
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  },

  // ===== BATCH OPERATIONS =====

  /**
   * Clear all user data and sessions (for logout)
   */
  async clearUserData(userId: string): Promise<void> {
    try {
      // Delete user
      await this.deleteUser(userId);

      // Delete sessions
      const sessionParams = {
        TableName: SESSIONS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      };
      const sessions = await dynamodb.query(sessionParams).promise();

      if (sessions.Items) {
        for (const session of sessions.Items) {
          const delParams = {
            TableName: SESSIONS_TABLE,
            Key: {
              userId,
              sessionId: (session as any).sessionId,
            },
          };
          await dynamodb.delete(delParams).promise();
        }
      }
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  },
};

export default awsStorageService;
