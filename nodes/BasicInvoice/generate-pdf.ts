import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMakePrinter from 'pdfmake';
import path from 'path';

const fonts = {
	Ubuntu: {
		normal: path.join(__dirname, './fonts/Ubuntu-Regular.ttf'),
		bold: path.join(__dirname, './fonts/Ubuntu-Bold.ttf'),
	},
};

const printer = new pdfMakePrinter(fonts);

export default function generatePdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
	return new Promise((success, reject) => {
		try {
			const doc = printer.createPdfKitDocument(docDefinition);

			let chunks: Uint8Array[] = [];

			doc.on('data', (chunk: Uint8Array) => {
				chunks.push(chunk);
			});

			doc.on('end', () => {
				success(Buffer.concat(chunks));
			});

			doc.end();
		} catch (err) {
			reject(err);
		}
	});
}

module.exports = generatePdf;
