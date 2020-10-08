exports.parseCSV = text => {
  if (typeof text === "string" && text.length > 0) {
    const rows = text
      .trim()
      .replace(/\r/g, "")
      .split("\n");
    return rows
      .filter(row => row.startsWith("ERROR"))
      .map(row => {
        return [
          row.substring(0, row.indexOf(",")),
          row.substring(row.indexOf(",") + 1)
        ];
      });
  } else return -1;
};

exports.parseNSV = text => {
  if (typeof text === "string" && text.length > 0) {
    const rows = text
      .trim()
      .replace(/\r/g, "")
      .split("\n\n");
    return rows
      .filter(row => row.startsWith("Record") || row.startsWith("ERROR"))
      .map(row => row.split("\n"));
  } else return -1;
};

exports.parseESV = text => {
  if (typeof text === "string" && text.length > 0) {
    text = text
      .trim()
      .replace(/\r/g, "")
      .replace(/\n/g, "");
    const rows = [];
    let offset = 0;

    while (text.indexOf("ERROR", offset) >= 0) {
      let errorPosition = text.indexOf("ERROR", offset);
      offset = errorPosition;
      let separatorPosition = text.indexOf(",", offset);
      let error = text.slice(errorPosition, separatorPosition);
      offset = separatorPosition + 1;
      errorPosition =
        text.indexOf("ERROR", offset) > 0
          ? text.indexOf("ERROR", offset)
          : offset + 100;
      let errorDescription = text.slice(offset, errorPosition);
      rows.push([error, errorDescription]);
    }
    return rows;
  } else return -1;
};

exports.parseAttachment = (attachment, type) => {
  switch (type) {
    case "ERROR-separated":
      return this.parseESV(attachment);
    case "newline-separated":
      return this.parseNSV(attachment);
    case "csv":
      return this.parseCSV(attachment);
    default:
      return this.parseCSV(attachment);
  }
};
