const connection = require("../databaseSQL/db");

module.exports = {
  checkMailCode: mailCode => {
    return new Promise(function(resolve, reject) {
      var uri =
        "https://api-ticket-v1.herokuapp.com/checkMailCode?id=" + mailCode;
      resolve(uri);
    });
  },
  genarateNumber: data => {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT MAX(number) AS gNumber FROM generate_num";
      let sql_genarate =
        "INSERT INTO generate_num (number) VALUES ('" + data + "')";
      connection.query(sql, function(error, results) {
        var result = 0;
        if (results[0].gNumber == 0 || results[0].gNumber == null) {
          result = results[0].gNumber + 1;
          connection.query(sql_genarate, function(error) {});
          groupNameId = result;
        } else {
          result = results[0].gNumber + 1;
          connection.query(sql_genarate, function(error) {});
        }
        resolve(results[0].gNumber);
      });
    });
  },
  addMessage: (
    result,
    reply_token,
    userId,
    groupId,
    timestamp,
    msgType,
    messageId,
    msg,
    msgText
  ) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO order_message (group_name_id, reply_token, user_id, group_id, timestamp, message_type, message_id, message_text, message_text_with_tag) VALUES ('" +
        result +
        "', '" +
        reply_token +
        "','" +
        userId +
        "','" +
        groupId +
        "','" +
        timestamp +
        "','" +
        msgType +
        "','" +
        messageId +
        "','" +
        msg +
        "','" +
        msgText +
        "')";
      connection.query(sql);
    });
  },
  insertGroupLine: (empty, result, status, groupId) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO group_line (group_name, group_name_id, status, line_group_id) VALUES (" +
        empty +
        ",'" +
        result +
        "','" +
        status +
        "','" +
        groupId +
        "')";
      connection.query(sql);
    });
  },
  findUsername: (userId, groupId) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT * FROM line_username WHERE line_user_id = '" +
        userId +
        "' AND line_group_id = '" +
        groupId +
        "'";
      connection.query(sql, (error, results, fields) => {
        if (results.length == 0 || typeof results == "undefined") {
          connection.query(
            "INSERT INTO line_username (line_user_id, line_group_id) VALUES ('" +
              userId +
              "','" +
              groupId +
              "')",
            function(error) {
              resolve(true);
            }
          );
        } else {
        }
      });
    });
  },
  updateGroupLine: (groupName, groupId) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "UPDATE group_line SET group_name = '" +
        groupName +
        "' WHERE line_group_id = '" +
        groupId +
        "'";
      connection.query(sql, function(error) {
        resolve(true);
      });
    });
  },
  insertRawData: (reply_token, groupId, rawdata) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO raw_data (reply_token, group_id, raw_data) VALUES ('" +
        reply_token +
        "','" +
        groupId +
        "','" +
        rawdata +
        "')";
      connection.query(sql, function(error) {
        resolve(true);
      });
    });
  },
  findGroupNameId: groupId => {
    return new Promise(function(resolve, reject) {
      let sql =
        "SELECT group_name_id FROM group_line WHERE line_group_id = '" +
        groupId +
        "'";
      connection.query(sql, function(error, results) {
        resolve(results);
      });
    });
  },
  insertOrderMessege: (
    result,
    reply_token,
    userId,
    groupId,
    timestamp,
    msgType,
    messageId,
    msg,
    pathFile
  ) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO order_message (group_name_id, reply_token, user_id, group_id, timestamp, message_type, message_id, message_text, image_url) VALUES ('" +
        result +
        "', '" +
        reply_token +
        "','" +
        userId +
        "','" +
        groupId +
        "','" +
        timestamp +
        "','" +
        msgType +
        "','" +
        messageId +
        "','" +
        msg +
        "','" +
        pathFile +
        "')";
      connection.query(sql, function(error, results) {
        resolve(results);
      });
    });
  },
  insertOrderMessege_sticker: (
    result,
    reply_token,
    stickerId,
    packageId,
    userId,
    groupId,
    timestamp,
    msgType,
    messageId
  ) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO order_message (group_name_id, reply_token, sticker_id, sticker_package_id, user_id, group_id, timestamp, message_type, message_id, message_text) VALUES ('" +
        result +
        "', '" +
        reply_token +
        "', '" +
        stickerId +
        "', '" +
        packageId +
        "','" +
        userId +
        "','" +
        groupId +
        "','" +
        timestamp +
        "','" +
        msgType +
        "','" +
        messageId +
        "','" +
        packageId +
        "')";
      connection.query(sql, function(error, results) {
        resolve(results);
      });
    });
  },
  insertOrderMessege_text: (
    groupNameId,
    reply_token,
    userId,
    groupId,
    timestamp,
    msgType,
    messageId,
    msg,
    msgText
  ) => {
    return new Promise(function(resolve, reject) {
      let sql =
        "INSERT INTO order_message (group_name_id, reply_token, user_id, group_id, timestamp, message_type, message_id, message_text, message_text_with_tag) VALUES ('" +
        groupNameId +
        "', '" +
        reply_token +
        "','" +
        userId +
        "','" +
        groupId +
        "','" +
        timestamp +
        "','" +
        msgType +
        "','" +
        messageId +
        "','" +
        msg +
        "','" +
        msgText +
        "')";
      connection.query(sql, function(error, results) {
        resolve(results);
      });
    });
  }
};
