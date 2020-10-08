module.exports = (data, errors) => {
  const colors = ["red", "yellow", "green", "blue"];
  const today = new Date();

  const datatable = Object.keys(data).reduce((output, key) => {
    output += `<tr>
    <td> ${key} </td>
    <td>
    <p style="border-radius: 5px; display: inline-block; background-color: ${
      colors[data[key].status]
    }; width: 10px; height: 10px;">
      </p>
    </td>
    <td> ${data[key].error || "OK"} </td>
    </tr>`;
    return output;
  }, "");

  const errortable = errors.reduce((output, row) => {
    output += `<tr>
      <td> ${row.name} </td>
      <td> ${row.message} </td>
    </tr>`;
    return output;
  }, "");

  const text =
    "Text version is currently not supported. Please make sure you can view the HTML emails";

  const html = `<h2> Morning checkup results </h2>
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
  <p> Sent on: ${today.toUTCString()} </p>`;
  return {
    text,
    html
  };
};
