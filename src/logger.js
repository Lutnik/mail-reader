const fs = require("fs");

module.exports = class Logger {
  constructor(path = "./") {
    this.path = path;
  }

  _whatToLog(msg) {
    if (!msg) return "Logger message error";
    if (typeof msg === "string") {
      return msg;
    }
    if (typeof msg === "object") {
      if (Object.prototype.hasOwnProperty.call(msg, "message")) {
        return msg.message;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "msg")) {
        return msg.msg;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "error")) {
        return msg.error;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "err")) {
        return msg.err;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "description")) {
        return msg.err;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "desc")) {
        return msg.err;
      }
      if (Object.prototype.hasOwnProperty.call(msg, "code")) {
        return msg.err;
      }
      return (
        Object.values(msg).find(val => typeof val === "string") ||
        msg.toString()
      );
    }
    return msg;
  }

  _openLogFile(dir, message = "") {
    const d = new Date();
    const filename = `Log ${d.getFullYear()}-${d.getMonth() +
      1}-${d.getDate()}`;

    fs.access(dir, fs.constants.F_OK, err => {
      if (err && err.code === "ENOENT") {
        fs.mkdir(dir, { recursive: false }, err => {
          if (err && !err.code === "EEXIST") {
            throw new Error(
              "Cannot access/create folder, please check permissions"
            );
          }
        });
      }
      fs.open(`${dir}/${filename}.txt`, "a", (err, fh) => {
        if (err)
          throw new Error(
            "Cannot access/create log file, please check permissions"
          );
        fs.appendFile(fh, `${d.toUTCString()}, ${message} \n`, "utf8", err => {
          fs.close(fh, err => {
            if (err) console.log(err.message);
          });
          if (err)
            throw new Error(
              "Cannot write to log file, please check permissions"
            );
        });
      });
    });
  }

  debug(dbg) {
    this._openLogFile(this.path, `[Debugger], ${this._whatToLog(dbg)}`);
  }

  info(inf) {
    this._openLogFile(this.path, `[Info], ${this._whatToLog(inf)}`);
  }

  warn(wrn) {
    this._openLogFile(this.path, `[Warning], ${this._whatToLog(wrn)}`);
  }

  error(err) {
    this._openLogFile(this.path, `[Error], ${this._whatToLog(err)}`);
  }
};
