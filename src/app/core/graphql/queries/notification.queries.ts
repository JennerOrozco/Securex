export const NOTIFICATION_QUERIES = {
  SEND_ATTEMPTS: `
    query SendAttempts($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      sendAttempts(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid app_uuid ip_address created_at
          app { name }
          user { full_name email profile_picture }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  NOTIFICATIONS: `
    query Notifications($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      notifications(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid company_uuid app_uuid user_email
          title message channels is_read email_sent
          type created_at
          app { name }
          user { full_name email profile_picture }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  USER_DEVICES: `
    query UserDevices($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      userDevices(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid app_uuid device_token device_type
          app { name }
          user { full_name email profile_picture }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  PUSH_SETTINGS: `
    query PushSettings($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      pushSettings(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id app_uuid vapid_public_key vapid_private_key vapid_subject url_base icon
          app { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  SMTP_SETTINGS: `
    query SmtpSettings($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      smtpSettings(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id app_uuid smtp_host smtp_port smtp_user smtp_pass smtp_encryption from_email from_name
          app { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  APPS: `
    query Apps($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      apps(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid name slug is_active
        }
        total
        currentPage
        perPage
        hasMorePages
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
  MARK_READ: `
    mutation MarkNotificationRead($id: Int!) {
      markNotificationRead(id: $id) {
        id is_read
      }
    }
  `,
  REGISTER_DEVICE: `
    mutation RegisterDevice($user_uuid: String!, $app_uuid: String!, $device_token: String!, $device_type: String) {
      registerDevice(user_uuid: $user_uuid, app_uuid: $app_uuid, device_token: $device_token, device_type: $device_type) {
        id device_token device_type
      }
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
  SAVE_SMTP_SETTING: `
    mutation SaveSmtpSetting($id: Int, $app_uuid: String!, $smtp_host: String!, $smtp_port: Int!, $smtp_user: String!, $smtp_pass: String, $smtp_encryption: String, $from_email: String!, $from_name: String) {
      saveSmtpSetting(id: $id, app_uuid: $app_uuid, smtp_host: $smtp_host, smtp_port: $smtp_port, smtp_user: $smtp_user, smtp_pass: $smtp_pass, smtp_encryption: $smtp_encryption, from_email: $from_email, from_name: $from_name) {
        id app_uuid smtp_host smtp_port smtp_encryption from_email from_name
      }
    }
  `,
  DELETE_SMTP_SETTING: `
    mutation DeleteSmtpSetting($id: Int!) {
      deleteSmtpSetting(id: $id)
    }
  `,
};
