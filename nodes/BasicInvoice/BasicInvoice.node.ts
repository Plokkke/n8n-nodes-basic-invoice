import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { InvoiceParams } from './types';
import { getInvoiceDocument } from './get-invoice-document';
import generatePdf from './generate-pdf';

export class BasicInvoice implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Basic Invoice',
		name: 'basicInvoice',
		group: ['transform'],
		version: 1,
		description: 'Basic Invoice Node',
		defaults: {
			name: 'Basic Invoice Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'string',
				default: '',
				placeholder: '{ "id": "1234", "date": "2021-01-01", "...": "..." }',
				description: 'All parameters of the invoice. Check the documentation for more details.',
			},
			// {
			// 	displayName: 'Invoice ID',
			// 	name: 'id',
			// 	type: 'string',
			// 	default: '',
			// 	placeholder: 'Invoice unique number',
			// }, {
			// 	displayName: 'Invoice Date',
			// 	name: 'date',
			// 	type: 'dateTime',
			// 	default: '',
			// 	placeholder: 'Invoice emission date',
			// }, {
			// 	displayName: 'Invoice Title',
			// 	name: 'title',
			// 	type: 'string',
			// 	default: 'Facture',
			// }, {
			//   displayName: 'Entreprise émettrice - Raison sociale',
			// 	name: 'fromLabel',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Forme juridique',
			// 	name: 'fromLegalForm',
			// 	type: 'string',
			// 	default: '',
			// }, {
			//  	displayName: 'Entreprise émettrice - SIRET',
			// 	name: 'fromSiret',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - APE',
			// 	name: 'fromApe',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Email',
			// 	name: 'fromEmail',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Rue',
			// 	name: 'fromStreet',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Code postal',
			// 	name: 'fromZipCode',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Ville',
			// 	name: 'fromCity',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Entreprise émettrice - Cachet (base64)',
			// 	name: 'fromCachetB64',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Client - Type',
			// 	name: 'clientType',
			// 	type: 'options',
			// 	typeOptions: [{
			// 		name: 'Entreprise',
			// 		value: 'company',
			// 	}, {
			// 		name: 'Particulier',
			// 		value: 'person',
			// 	}],
			// 	default: 'person',
			// }, {
			// 	displayName: 'Client - Nom',
			// 	name: 'clientName',
			// 	type: 'string',
			// 	default: '',
			// 	displayOptions: {
			// 		show: {
			// 			clientLegalForm: ['clientType'],
			// 		},
			// 	},
			// }, {
			// 	displayName: 'Client - Email',
			// 	name: 'clientEmail',
			// 	type: 'string',
			// 	default: '',
			// }, {
			// 	displayName: 'Client - Numéro de sécurité sociale',
			// 	name: 'clientNationalNumber',
			// 	type: 'string',
			// 	default: '',
			// 	displayOptions: {
			// 		show: {
			// 			clientLegalForm: ['clientType'],
			// 		},
			// 	},
			// }, {
			// 	displayName: 'Lignes de facture',
			// 	name: 'lines',
			// 	type: 'collection',
			// 	typeOptions: {
			// 		multipleValues: true,
			// 	},
			// 	placeholder: 'Ajouter une ligne de facture',
			// 	default: [],
			// 	options: [{
			// 		displayName: 'Description',
			// 		name: 'description',
			// 		type: 'string',
			// 		default: '',
			// 	}, {
			// 		displayName: 'Quantité',
			// 		name: 'quantity',
			// 		type: 'number',
			// 		default: 1,
			// 	}, {
			// 		displayName: 'Prix unitaire',
			// 		name: 'unitPrice',
			// 		type: 'number',
			// 		default: 0,
			// 	}, {
			// 		displayName: 'Taux de TVA',
			// 		name: 'vatRate',
			// 		type: 'number',
			// 		default: 20,
			// 	}]
			// }, {
			// 	displayName: 'Whether the invoice is paid',
			// 	name: 'isPaid',
			// 	type: 'boolean',
			// 	default: false,
			// }, {
			// 	displayName: 'Whether the invoice is VAT-free',
			// 	name: 'noVat',
			// 	type: 'boolean',
			// 	default: false,
			// }, {
			// 	displayName: 'Footer details',
			// 	name: 'footerDetails',
			// 	type: 'string',
			// 	default: '',
			// }
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const payload = this.getNodeParameter('payload', itemIndex, '') as string;
				const invoice: InvoiceParams = JSON.parse(payload);
				const fileName = `${invoice.title} ${invoice.from.label} ${invoice.id}.pdf`;

				const pdfBuffer = await generatePdf(getInvoiceDocument(invoice));

				results.push({
					json: {data: 1},
					binary: {
						invoice: {
							data: pdfBuffer.toString('base64'),
							mimeType: 'application/pdf',
							fileName,
							fileExtension: 'pdf',
						},
					},
				});
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}

			return this.prepareOutputData(results);
		}

		return this.prepareOutputData(items);
	}
}
