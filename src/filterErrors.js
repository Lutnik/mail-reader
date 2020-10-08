exports.filterErrors = (err, list) => {
  return err.filter(
    row =>
      // true - row included (legit error - must be reported)
      !list.some(e => row[1].toLowerCase().includes(e.toLowerCase()))
  );
};
