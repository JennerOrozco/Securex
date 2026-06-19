import{a as p}from"./chunk-N2ZLCQYS.js";import{G as l,q as o}from"./chunk-AIOGRGFU.js";var r={SEND_ATTEMPTS:`
    query SendAttempts($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      sendAttempts(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid app_uuid ip_address created_at
          app { name }
          user { full_name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,NOTIFICATIONS:`
    query Notifications($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      notifications(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid company_uuid app_uuid user_email
          title message channels is_read email_sent
          type created_at
          app { name }
          user { full_name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,USER_DEVICES:`
    query UserDevices($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      userDevices(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_uuid app_uuid device_token device_type
          app { name }
          user { full_name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,PUSH_SETTINGS:`
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
  `,SMTP_SETTINGS:`
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
  `,APPS:`
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
  `},s={DELETE_NOTIFICATION:`
    mutation DeleteNotification($id: Int!) {
      deleteNotification(id: $id)
    }
  `,DELETE_DEVICE:`
    mutation DeleteDevice($id: Int!) {
      deleteDevice(id: $id)
    }
  `,DELETE_SEND_ATTEMPT:`
    mutation DeleteSendAttempt($id: Int!) {
      deleteSendAttempt(id: $id)
    }
  `};var u=class a extends p{get baseUrl(){return this.configService.notificationApiUrl}savePushSetting(t,e){return t?this.http.put(`${this.baseUrl}/notifications/admin/push-settings/${t}`,e):this.http.post(`${this.baseUrl}/notifications/admin/push-settings`,e)}deletePushSetting(t){return this.http.delete(`${this.baseUrl}/notifications/admin/push-settings/${t}`)}saveSmtpSetting(t,e){return t?this.http.put(`${this.baseUrl}/notifications/admin/smtp-settings/${t}`,e):this.http.post(`${this.baseUrl}/notifications/admin/smtp-settings`,e)}deleteSmtpSetting(t){return this.http.delete(`${this.baseUrl}/notifications/admin/smtp-settings/${t}`)}sendNotificationToAny(t){return this.http.post(`${this.baseUrl}/notifications/send`,t)}generateVapid(){return this.http.get(`${this.baseUrl}/notifications/admin/generate-vapid`)}getNotificationsHistory(t){return this.http.get(`${this.baseUrl}/notifications/superadmin/notifications`,{params:t})}deleteSendAttemptGql(t){return this.gqlMutate("notification",s.DELETE_SEND_ATTEMPT,"deleteSendAttempt",{id:t})}getSendAttemptsGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.SEND_ATTEMPTS,"sendAttempts",{page:t,limit:e,filter:i,sort:n})}getNotificationsHistoryGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.NOTIFICATIONS,"notifications",{page:t,limit:e,filter:i,sort:n})}deleteNotificationHistoryGql(t){return this.gqlMutate("notification",s.DELETE_NOTIFICATION,"deleteNotification",{id:t})}getUserDevicesGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.USER_DEVICES,"userDevices",{page:t,limit:e,filter:i,sort:n})}deleteUserDeviceGql(t){return this.gqlMutate("notification",s.DELETE_DEVICE,"deleteDevice",{id:t})}getPushSettingsGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.PUSH_SETTINGS,"pushSettings",{page:t,limit:e,filter:i,sort:n})}getSmtpSettingsGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.SMTP_SETTINGS,"smtpSettings",{page:t,limit:e,filter:i,sort:n})}getAppsGql(t=1,e=15,i,n){return this.gqlQuerySingle("notification",r.APPS,"apps",{page:t,limit:e,filter:i,sort:n})}static \u0275fac=(()=>{let t;return function(i){return(t||(t=l(a)))(i||a)}})();static \u0275prov=o({token:a,factory:a.\u0275fac,providedIn:"root"})};export{u as a};
