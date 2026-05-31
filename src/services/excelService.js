import * as XLSX from "xlsx";

export async function leerExcel(file) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.onload =
        (e) => {

          try {

            const data =
              new Uint8Array(
                e.target.result
              );

            const workbook =
              XLSX.read(
                data,
                {
                  type:
                    "array"
                }
              );

            const sheetName =
              workbook
                .SheetNames[0];

            const sheet =
              workbook
                .Sheets[
                  sheetName
                ];

            const rows =
              XLSX.utils.sheet_to_json(
                sheet,
                {
                  defval: ""
                }
              );

            resolve(rows);

          } catch (
            error
          ) {

            reject(error);

          }

        };

      reader.readAsArrayBuffer(
        file
      );

    }
  );

}