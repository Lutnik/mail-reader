module.exports = (data = {}, errors = []) => {
  const statusEmoji = ["(X)", "(!)", "OK", "OK"];
  const colors = ["red", "gold", "green", "blue"];
  // 🛑⚠🔵✔
  const today = new Date();

  const datatable = Object.keys(data).reduce((output, key) => {
    output += `<tr>
    <td> ${key} </td>
    <td style="color:
    ${data[key].delivered ? colors[data[key].status] : colors[0]}
    ">
      ${data[key].delivered ? statusEmoji[data[key].status] : statusEmoji[0]}
    </td>
    <td> ${
      data[key].error ? data[key].error.replace(/\n/g, "<br />") : "OK"
    } </td>
    </tr>`;
    return output;
  }, "");

  const errortable = errors.reduce((output, row) => {
    output += `<tr style="border-bottom: 1px solid blue;">
      <td> ${row.name} </td>
      <td> ${row.message} </td>
    </tr>`;
    return output;
  }, "");

  const text =
    "Text version is currently not supported. Please make sure you can view the HTML emails";

  const html = `
  <body style="
    background-color: #EEEEEE;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    mso-line-height-rule: exactly;"
  >
  <table style="
    width: 100%;
    background-color: #EEEEEE;
    margin: 0;"
  bgcolor="#EEEEEE"
  role="presentation" width="100%" cellpadding="0" cellspacing="0" align="left" border="0">
  <tr>
  <td style="width: 20px"> </td>
  <td style="
    background-color: #FFFFFF;
    border-radius: 5px;
    padding: 10px 20px;"
  bgcolor="#FFFFFF">
    <h2> Morning checkup results <br /> <br /> </h2>
    <h3> Connectors: </h3>
    <table>
      <tr>
        <th> Connector name </th>
        <th> Status </th>
        <th> Errors to review </th>
      </tr>
        ${datatable}
    </table>
    <br />
    <br />
    <h3> Errors: </h3>
    <table>
      <tr>
        <th> Error </th>
        <th> Description </th>
      </tr>
        ${errortable}
    </table>
    <br />
    <p> Sent on: ${today.toUTCString()} </p>
    </td>
    <td style="width: 20px;"> </td>
    </tr>
  </table>
  </body>`;
  return {
    text,
    html
  };
};
