module.exports = mail => {
  if (!mail.uid) return false;
  if (!mail.envelope) return false;
  if (!mail.envelope.subject) return false;
  if (!mail.bodyStructure) return false;
  if (mail.bodyStructure.encoding) return checkBodyParts(1); // no attachment email
  if (!mail.bodyStructure.childNodes) return false;
  const { childNodes } = mail.bodyStructure;
  if (!Array.isArray(childNodes) || childNodes.length < 2) {
    return false;
  }
  const [part1, part2] = childNodes;
  if (part1.encoding) {
    if (!part2.disposition) return checkBodyParts(1); // no attachment html email
    return checkBodyParts(2); // 1 attachment text email
  }
  if (!part1.childNodes) return false;
  if (!part1.parameters.boundary) return false;
  if (!Array.isArray(part1.childNodes) || part1.childNodes.length < 2)
    return false;
  if (!part1.childNodes[0].type && !part1.childNodes[0].encoding) return false;
  // here we assume that part2 is an attachment,
  // if message has 3 parts (e.g. embedded pictures in part 2) then validation will fail
  if (!part2.disposition && part2.disposition !== "attachment") return false;

  return checkBodyParts(2); // 1 attachment and html email

  function checkBodyParts(i) {
    if (i === 1) {
      return !!mail.bodyParts.get("1");
    }
    if (i === 2) {
      return !!mail.bodyParts.get("1") && !!mail.bodyParts.get("2");
    }
  }
};
