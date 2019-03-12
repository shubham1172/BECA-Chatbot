dict = {"first": 1, "second": 2, "third": 3, "fourth": 4}

exports.ordinal_to_cardinal = (query_with_ordinal) => {
  if (!isNaN(query_with_ordinal[0])) {
    return Number(query_with_ordinal[0])
  }
  words = query_with_ordinal.split(" ")
  for(var i=0; i<words.length; i++) {
    cardinal = dict[words[i]]
    if (cardinal)
      return cardinal
  }
  return -1
}
