'use strict';

const _ = require('lodash');
const {sheetId} = require("./config.json")
const creds = require('./serviceAccount.json');
const GoogleSpreadsheet = require('google-spreadsheet');

function getWorksheets(spreadsheetId, creds) {
  const doc = new GoogleSpreadsheet(spreadsheetId);
  return new Promise((resolve, reject) =>
    doc.useServiceAccountAuth(creds, (error) => {
      if (error) return reject(error);
      return doc.getInfo((err, info) => {
        if (err) return reject(err);
        return resolve(info);
      });
    }),
  );
}

// TODO: Refactor Spreadsheet so it uses only the rowAPI

class SpreadSheet {
  // build sets this.rows based in the remote Google Sheet.
  build(tabName) {
    return new Promise((resolve, reject) => {
      if (!tabName) {
        reject(
          'ERROR: You need to specify the tab name in the remote Google Sheet.',
        );
      }
      getWorksheets(sheetId, creds).then((res) => {
        /* eslint-disable */
        const testSheet = res.worksheets.find(f => f.title === tabName);
        testSheet.getCells(
          {
            offset: 1
          },
          (err, cells) => {
            this.cells = cells;

            const sheetObj = cells.map(m => ({
              value: m._value,
              row: m.row
            }));

            const rows = _.values(_.groupBy(sheetObj, "row")).map(m =>
              m.map(o => o.value)
            ); // eslint-disable

            this.rows = rows;
            this.tabName = tabName;
            // return resolve(rows);

            testSheet.getRows(
              {
                offset: 1,
                limit: 20
              },
              (err, rowsAPI) => {
                this.rowsArray = rowsAPI;
                return resolve();
              }
            );
          }
        );
      });
    });
  }

  generateColumnArray(columnName){
    return this.rowsArray.map(row=> row[columnName])
  }

  // TODO: We need to refactor this so getRows only runs once.
  getUserSaysArray() {
    const userSaysArray = this.rows.map(row => row[0]);
    // ignoring the header
    userSaysArray.shift();
    return userSaysArray.filter(message => message !== "");
  }

  getAssistantSaysArray() {
    const assistantSays = this.rows.map(row => row[1]);
    // ignoring the header
    assistantSays.shift();
    return assistantSays.filter(message => message !== "");
  }

  getExpectedResponsesArray() {
    const expectedResponses = this.rows.map(row => row[2]);
    // ignoring the header
    expectedResponses.shift();
    return expectedResponses.filter(message => message !== "");
  }

  getCellValue(col, row) {
    for (let index = 0; index < this.cells.length; index++) {
      const cell = this.cells[index];
      // console.log(cell.value)
      if (cell.col == col && cell.row == row) {
        return cell.value;
      }
    }
  }

  async flagFailedRow(errorRow) {
    return new Promise(async (resolve, reject) => {
      const errorIndex = errorRow -2;
      this.rowsArray[errorIndex].status = "FAILED";
      // await is not working here when used with mocha.
      await this.rowsArray[errorIndex].save();
      // For some reason async/await is not working when using with mocha. This is a temporary fix:
      setTimeout(()=>{
        resolve()
      }, 2000)

    });
  }

  updateCell(col, row, value) {
    return new Promise((resolve, reject) => {
      getWorksheets(sheetId, privatekey).then(res => {
        /* eslint-disable */
        const testSheet = res.worksheets.find(f => f.title === this.tabName);
        testSheet.getCells(
          {
            offset: 1
          },
          async (err, cells) => {
            cells.forEach(async cell => {
              if (cell.col == col && cell.row == row) {
                cell.setValue(value, () => {
                  return resolve("cell updated");
                });
              }
            });
          }
        );
        /* eslint-enable */
      });
    });
  }
}

module.exports = SpreadSheet;