const SpreadSheet = require("./SpreadSheet")


async function init() {
    const sheet = new SpreadSheet();
    const tabName = "test"
    await sheet.build(tabName);
    console.log("done")

    const arr = sheet.generateColumnArray("usersays")
    console.log(arr)
}

init();