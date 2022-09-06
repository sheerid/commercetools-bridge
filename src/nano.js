function nano() {
  var hrTime = process.hrtime()
  return (hrTime[0] * 1000000000 + hrTime[1]).toString(36)
}

export { nano };
