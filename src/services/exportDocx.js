import {
  Document,
  Packer,
  Paragraph
} from "docx";

import {
  saveAs
} from "file-saver";

export async function exportarDOCX(
  texto
) {

  const doc =
    new Document({

      sections: [

        {

          children:

            texto
              .split("\n")
              .map(
                linea =>
                  new Paragraph(
                    linea
                  )
              )

        }

      ]

    });

  const blob =
    await Packer.toBlob(
      doc
    );

  saveAs(
    blob,
    "Informe_Incidencias.docx"
  );

}