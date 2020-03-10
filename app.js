var express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
var querystring = require("querystring");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var service = require("./service/line-service");

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

const connection = require("./databaseSQL/db");

// line API Service
var API_Token =
  "";


connection.connect();

app.post("/webhook", (req, res) => {
  try {
    var groupId;
    var status = 0;
    if (req.body.events[0].type == "join") {
      groupId = req.body.events[0].source.groupId;
      // let packages = [];
      var checkGenerateNumber = new Promise(function(resolve, reject) {
        service.genarateNumber(data).then(function(result) {
          resolve(result);
        });
      });
      checkGenerateNumber.then(function(result) {
        service.insertGroupLine(null, result, status, groupId);
      });
    } else if (req.body.events[0].type == "message") {
      var reply_token = req.body.events[0].replyToken;
      var msg = req.body.events[0].message.text;
      var userId = req.body.events[0].source.userId;
      if (req.body.events[0].source.type === "group") {
        // line Type = group
        groupId = req.body.events[0].source.groupId;
        var data = req.body.events[0];
        var rawdata = JSON.stringify(data);
        var messageId = req.body.events[0].message.id;
        var timestamp = req.body.events[0].timestamp;
        var msgType = req.body.events[0].message.type;
        var stickerId = req.body.events[0].message.stickerId;
        var packageId = req.body.events[0].message.packageId;

        service.findUsername(userId, groupId).then(function(data) {});

        if (typeof msg !== "undefined") {
          if (msg.startsWith("cname")) {
            var groupName;
            if (msg.search(" = ") > 1) {
              groupName = msg.split(" = ");
            }
            groupName.remove(0);
            service.updateGroupLine(groupName[0], groupId).then(function(data) {
              if (data === true) {
                reply(reply_token, msg);
              }
            });
          }
          data["message"]["text"] = checkSyntax(data["message"]["text"]);
          rawdata = JSON.stringify(data);
          msg = checkSyntax(req.body.events[0].message.text);
          var msgText = checkSyntaxMsg(msg);
        }
        service
          .insertRawData(reply_token, groupId, rawdata)
          .then(function(data) {});
        var groupNameId = 0;
        service.findGroupNameId(groupId).then(function(results) {
          if (results.length === 0) {
            var getInformationFromDB = new Promise(function(resolve, reject) {
              service.genarateNumber(data).then(function(result) {
                resolve(result);
              });
            });
            getInformationFromDB.then(function(result) {
              if (msgType == "text") {
                service.addMessage(
                  result,
                  reply_token,
                  userId,
                  groupId,
                  timestamp,
                  msgType,
                  messageId,
                  msg,
                  msgText
                );
              } else if (msgType == "image") {
                request.get(
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: API_Token
                    },
                    url:
                      "https://api.line.me/v2/bot/message/" +
                      messageId +
                      "/content",
                    encoding: "binary",
                    timeout: 60000, // 60 seconds
                    resolveWithFullResponse: true
                  },
                  (err, obj) => {
                    const imageBinaryData = obj.body;
                    const base64EncodedImage = Buffer.from(
                      imageBinaryData,
                      "binary"
                    ).toString("base64");

                    var data = { base64: base64EncodedImage };
                    var qs = querystring.stringify(data);
                    var qslength = qs.length;
                    request.post(
                      {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded",
                          "Content-Length": qslength
                        },
                        url: "",
                        body: qs
                      },
                      function(error, response, body) {
                        if (error) throw error;
                        var bodyJSON = JSON.parse(body);
                        var pathFile =
                          "uploads/images/backend/" + bodyJSON.name;
                        service
                          .insertOrderMessege(
                            result,
                            reply_token,
                            userId,
                            groupId,
                            timestamp,
                            msgType,
                            messageId,
                            msg,
                            pathFile
                          )
                          .then(function(results) {});
                      }
                    );
                  }
                );
              } else if (msgType == "sticker") {
                service
                  .insertOrderMessege_sticker(
                    result,
                    reply_token,
                    stickerId,
                    packageId,
                    userId,
                    groupId,
                    timestamp,
                    msgType,
                    messageId
                  )
                  .then(function(results) {});
              } else {
              }
            });
          } else {
            groupNameId = results[0].group_name_id;
            if (msgType == "text") {
              service
                .insertOrderMessege_text(
                  groupNameId,
                  reply_token,
                  userId,
                  groupId,
                  timestamp,
                  msgType,
                  messageId,
                  msg,
                  msgText
                )
                .then(function(results) {});
              // });
            } else if (msgType == "image") {
              request.get(
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: API_Token
                  },
                  url:
                    "https://api.line.me/v2/bot/message/" +
                    messageId +
                    "/content",
                  encoding: "binary",
                  timeout: 60000, // 60 seconds
                  resolveWithFullResponse: true
                },
                (err, obj) => {
                  const imageBinaryData = obj.body;
                  const base64EncodedImage = Buffer.from(
                    imageBinaryData,
                    "binary"
                  ).toString("base64");

                  var data = { base64: base64EncodedImage };
                  var qs = querystring.stringify(data);
                  var qslength = qs.length;
                  request.post(
                    {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "Content-Length": qslength
                      },
                      url: "",
                      body: qs
                    },
                    function(error, response, body) {
                      if (error) throw error;
                      var bodyJSON = JSON.parse(body);
                      var pathFile = "uploads/images/backend/" + bodyJSON.name;
                      service
                        .insertOrderMessege(
                          groupNameId,
                          reply_token,
                          userId,
                          groupId,
                          timestamp,
                          msgType,
                          messageId,
                          msg,
                          pathFile
                        )
                        .then(function(results) {});
                    }
                  );
                }
              );
            } else if (msgType == "sticker") {
              service
                .insertOrderMessege_sticker(
                  groupNameId,
                  reply_token,
                  stickerId,
                  packageId,
                  userId,
                  groupId,
                  timestamp,
                  msgType,
                  messageId
                )
                .then(function(results) {});
            } else {
            }
          }
          sendDataForGenerate();
        });
      } else {
        // Line Type = User
        if (req.body.events[0].message.type === "text") {
          const msgSearch =
            "msg.search('tdz') > 1 || msg.search('TdZ') > 1 || msg.search('tdZ') > 1 || msg.search('Tdz') > 1 || msg.search('tDZ') > 1 || msg.search('tDz') > 1";
          const msgSearch2 =
            'msg.startsWith("tdz") || msg.startsWith("TdZ") || msg.startsWith("tdZ") || msg.startsWith("Tdz") || msg.startsWith("tDZ") || msg.startsWith("tDz")';
          if (msgSearch || msgSearch2) {
            msg = msg.toLocaleUpperCase();
          }
          var searchSyntax = msg.search("TDZ");
          if (searchSyntax > 1 || msg.startsWith("TDZ")) {
            var str = msg.split(/[ \n]/g);
            const result = str.filter(t => {
              return t.startsWith("TDZ");
            });
            if (result.length > 1) {
              replyNotice(req.body.events[0].replyToken, {
                status: "more",
                user_type: req.body.events[0].source.type
              });
            } else {
              service.checkMailCode(result[0]).then(res2 => {
                request.get(
                  {
                    headers: {
                      "Content-Type": "application/json"
                    },
                    url: encodeURI(res2)
                  },
                  (error, data) => {
                    let dataObj = JSON.parse(data.body);
                    replyTicket(reply_token, result, userId, dataObj);
                  }
                );
              });
            }
          } else {
            replyNotice(req.body.events[0].replyToken, {
              status: "welcome",
              user_type: req.body.events[0].source.type
            });
          }
        }
      }
    } else if (req.body.events[0].type === "postback") {
      var raw_data = JSON.parse(
        JSON.stringify(req.body.events[0].postback.data)
      );
      var dataObj = JSON.parse(raw_data);
      var user_Id = req.body.events[0].source.userId;
      var user_Type = req.body.events[0].source.type;
      var date_Time = req.body.events[0].timestamp;
      var mailCode = dataObj.mailcode;
      var orderName = dataObj.ordername;
      var orderPhone = dataObj.orderphoneno;
      if (dataObj.status === "open") {
        let body = {
          userId: user_Id,
          userType: user_Type,
          timestamp: date_Time,
          tracking: mailCode,
          orderName: orderName,
          phone: orderPhone
        };
        request.post(
          {
            headers: {
              "Content-Type": "application/json"
            },
            url:
              "",
            body: body,
            json: true
          },
          (err, res) => {
            if (err) console.log("error");
            if (res.body == "Success") {
              replyNotice(req.body.events[0].replyToken, {
                status: dataObj.status,
                user_type: user_Type
              });
            } else {
              replyNotice(req.body.events[0].replyToken, {
                status: "fail",
                user_type: user_Type
              });
            }
            connection.destroy();
          }
        );
      } else {
        replyNotice(req.body.events[0].replyToken, {
          status: dataObj.status,
          user_type: user_Type
        });
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

function replyTicket(reply_token, result, userId, dataObj) {
  let body;
  if (dataObj.status === true) {
    body = {
      to: userId,
      messages: [
        {
          type: "text",
          text:
            "Tracking: " +
            result[0] +
            "\nชื่อ: " +
            dataObj.data[0].ordername.replace(/,/g, "") +
            "\nเบอร์โทร: " +
            changeDoubleSix(dataObj.data[0].orderphoneno) +
            "\nข้อมูลถูกต้องนะคะ?",
          quickReply: {
            items: [
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "ตรวจสอบสถานะ",
                  data:
                    '{"mailcode":"' +
                    result[0] +
                    '", "ordername":"' +
                    dataObj.data[0].ordername.replace(/,/g, "") +
                    '", "orderphoneno":"' +
                    changeDoubleSix(dataObj.data[0].orderphoneno) +
                    '", "status":"open"}',
                  displayText: "ตรวจสอบสถานะ"
                }
              },
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "ข้อมูลไม่ถูกต้อง",
                  data: '{"status":"close"}',
                  displayText: "ข้อมูลไม่ถูกต้อง"
                }
              }
            ]
          }
        }
      ]
    };
  } else {
    body = {
      to: userId,
      messages: [
        {
          type: "text",
          text: "ไม่พบ " + result[0] + " ในระบบ \n" + "รบกวนตรวจอีกครั้งนะคะ"
        }
      ]
    };
  }
  lineRequest_Push(body);
}

function replyNotice(reply_token, msg) {
  let body;
  if (msg.status === "open" && msg.user_type === "user") {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: "จะรีบตรวจสอบให้ทันทีเลยนะคะ รอสักครู่ค่าา ^^"
        }
      ]
    };
  } else if (msg.status === "fail" && msg.user_type === "user") {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: "ไม่สามารถตรวจสอบได้ในขณะนี้"
        }
      ]
    };
  } else if (msg.status === "close" && msg.user_type === "user") {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: "ยินดีให้บริการค่ะ ><"
        }
      ]
    };
  } else if (msg.status === "more" && msg.user_type === "user") {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: "ไม่สามารถเช็ค Tracking ได้มากกว่า 1 ค่ะ"
        }
      ]
    };
  } else if (msg.status === "welcome" && msg.user_type === "user") {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text:
            "สวัสดีค่ะ \n" +
            "MY945 ยินดีให้บริการค่าา ><\n" +
            "\n" +
            "ถ้ามีเลข Tracking แล้วแจ้งได้เลยนะคะ"
        }
      ]
    };
  }
  lineRequest_Reply(body);
}

function reply(reply_token, msg) {
  let body;
  if (msg.startsWith("cname")) {
    body = {
      replyToken: reply_token,
      messages: [
        {
          type: "sticker",
          packageId: 11537,
          stickerId: 52002739
        }
      ]
    };
  }
  lineRequest_Reply(body);
}

function lineRequest_Push(body) {
  request.post(
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: API_Token
      },
      url: "https://api.line.me/v2/bot/message/push",
      body: body,
      json: true
    },
    (err, res) => {
      if (err) console.log("error");
      if (res) console.log("success" + res.statusCode);
    }
  );
}

function lineRequest_Reply(body) {
  request.post(
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: API_Token
      },
      url: "https://api.line.me/v2/bot/message/reply",
      body: body,
      json: true
    },
    (err, res) => {
      if (err) console.log("error");
      if (res) console.log("success" + res.statusCode);
    }
  );
}

function sendDataForGenerate() {
  request.get({
    url: "",
    json: true
  });
}

function checkSyntax(text) {
  var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return text
    .replace(/&/g, "&amp;")
    .replace(regexAstralSymbols, "_")
    .replace(/\\/g, "/")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function checkSyntaxMsg(text) {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

function changeDoubleSix(tel) {
  var regex = /^66[0-9]{8,9}$/i;
  if (tel[0] + tel[1] == "66") {
    var phoneNO = "0";
    for (let i = 2; i < tel.length; i++) {
      phoneNO += tel[i];
    }
  }
  return phoneNO;
}

app.listen(port, () => {
  console.log("application is listening on:", port);
});
