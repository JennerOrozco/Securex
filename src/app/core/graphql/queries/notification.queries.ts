export const NOTIFICATION_QUERIES = {
  SEND_ATTEMPTS: `
    query SendAttempts {
      sendAttempts {
        id user_uuid app_uuid ip_address created_at
        app { name }
        user { full_name }
      }
    }
  `,
  NOTIFICATIONS: `
    query Notifications {
      notifications {
        id user_uuid company_uuid app_uuid user_email
        title message channels is_read email_sent
        type created_at
        app { name }
        user { full_name }
      }
    }
  `,
  USER_DEVICES: `
    query UserDevices {
      userDevices {
        id user_uuid app_uuid device_token device_type
        app { name }
        user { full_name }
      }
    }
  `,
  PUSH_SETTINGS: `
    query PushSettings {
      pushSettings {
        id app_uuid vapid_public_key vapid_private_key vapid_subject url_base icon
        app { name }
      }
    }
  `,
  SMTP_SETTINGS: `
    query SmtpSettings {
      smtpSettings {
        id app_uuid smtp_host smtp_port smtp_user smtp_pass smtp_encryption from_email from_name
        app { name }
      }
    }
  `,
};

export const NOTIFICATION_MUTATIONS = {
  DELETE_NOTIFICATION: `
    mutation DeleteNotification($id: Int!) {
      deleteNotification(id: $id)
    }
  `,
  DELETE_DEVICE: `
    mutation DeleteDevice($id: Int!) {
      deleteDevice(id: $id)
    }
  `,
  DELETE_SEND_ATTEMPT: `
    mutation DeleteSendAttempt($id: Int!) {
      deleteSendAttempt(id: $id)
    }
  `,
};
