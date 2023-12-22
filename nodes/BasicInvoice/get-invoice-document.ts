import Intl from 'intl';

import { getNetTotal, getGrossTotal, getVATTotal } from './calculator.utils';
import { Address, Company, InvoiceLine, InvoiceParams, Person } from './types';
import { Content, ContentText, Style, TDocumentDefinitions } from 'pdfmake/interfaces';

const priceFormatter = new Intl.NumberFormat('fr-FR', {
	style: 'currency',
	currency: 'EUR',
	minimumFractionDigits: 2,
});

function printPrice(price: number): string {
	return priceFormatter.format(price / 100);
}

function printDate(date: string): string {
	return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
}

function printLines(lines: InvoiceLine[]): ContentText[][] {
	return lines.map((line): ContentText[] => [
		{ text: line.description },
		{ text: line.quantity },
		{ text: printPrice(line.unitPrice) },
	]);
}

function printNationalNumber(nationalNumber: string, options?: Style): ContentText[] {
	return [
		{
			...options,
			text: nationalNumber
				.replace(/ /g, '')
				.replace(/(.)(..)(..)(..)(...)(...)(..)/, '$1 $2 $3 $4 $5 $6 $7'),
		},
	];
}

function printAddress(address: Address, options?: Style): ContentText[] {
	return [
		{ ...options, text: address.street },
		{ ...options, text: `${address.zipCode}, ${address.city}` },
	];
}

function printCompany(company: Company, options?: Style): ContentText[] {
	return [
		{ ...options, text: company.label },
		...printAddress(company.address, options),
		{ ...options, text: company.email },
	];
}

function printPerson(person: Person, options?: Style): ContentText[] {
	const hasNationalNumber =
		typeof person.nationalNumber === 'string' && person.nationalNumber.length > 0;
	const showNationalNumberSlot = person.nationalNumber === true || person.nationalNumber === '';
	return [
		{ ...options, text: person.name },
		...(person.address ? printAddress(person.address, options) : []),
		...(hasNationalNumber ? printNationalNumber(person.nationalNumber as string, options) : []),
		...(showNationalNumberSlot ? [{ ...options, text: 'N° assuré: _ __ __ __ ___ ___ __' }] : []),
	];
}

function printClient(client: Person | Company, options?: Style): Content[] {
	const isCompany = 'siret' in client;
	return isCompany
		? printCompany(client as Company, options)
		: printPerson(client as Person, options);
}

export function getInvoiceDocument(invoice: InvoiceParams): TDocumentDefinitions {
	return {
		content: [
			{ text: `Date: ${printDate(invoice.date)}`, style: 'h4' },
			'\n\n',
			{ text: 'Praticien', style: 'h4' },
			...printCompany(invoice.from),
			{ text: 'Patient', alignment: 'right', style: 'h4' },
			...printClient(invoice.client, { alignment: 'right' }),
			'\n\n\n',
			{ text: invoice.title + ' ' + invoice.id, style: 'h3', alignment: 'center' },
			'\n\n\n',
			{
				table: {
					headerRows: 1,
					widths: ['30%', '20%', '20%', '30%'],
					body: [
						[
							{ text: 'Objet', style: 'h4' },
							{ text: 'Quantité', style: 'h4' },
							{ text: 'Prix unitaire HT', style: 'h4' },
						],
						...printLines(invoice.lines),
					],
				},
				layout: 'noBorders',
			},
			'\n',
			{
				table: {
					headerRows: 0,
					widths: ['75%', '15%', '10%'],
					body: [
						['', 'Total HT', { text: printPrice(getNetTotal(invoice.lines)), alignment: 'right' }],
						['', 'Total TVA', { text: printPrice(getVATTotal(invoice.lines)), alignment: 'right' }],
						[
							'',
							{ text: 'TOTAL TTC', style: 'h4' },
							{
								text: printPrice(getGrossTotal(invoice.lines)),
								alignment: 'right',
							},
						],
					],
				},
				layout: 'noBorders',
			},
			{ text: invoice.isPaid ? 'Acquitté' : 'Non acquité', style: 'h4', alignment: 'right' },
			'\n\n',
			{
				text: invoice.noVat
					? 'TVA non applicable en vertu de l’article 293 B du code général des impôts'
					: '\n',
				style: 'notice',
			},
			'\n\n',
			{
				image: 'data:' + invoice.from.cachet.mimeType + ';base64,' + invoice.from.cachet.base64 ,
				width: 110,
				alignment: 'right',
				margin: [0, 0, 10, 0],
			},
		],
		footer: [
			{
				text: `${invoice.from.label} ${invoice.from.legalForm} - ${invoice.from.address.street}, ${invoice.from.address.zipCode} ${invoice.from.address.city}`,
				alignment: 'center',
				style: 'footer',
			},
			{
				text: `Siret : ${invoice.from.siret} - APE : ${invoice.from.ape}`,
				alignment: 'center',
				style: 'footer',
			},
			...(invoice.footerDetails
				? [{ text: invoice.footerDetails, alignment: 'center', style: 'footer' } as ContentText]
				: []),
		],
		pageMargins: [40, 80, 40, 60],
		defaultStyle: {
			fontSize: 10,
			font: 'Ubuntu',
		},
		styles: {
			notice: {
				fontSize: 9,
			},
			h3: {
				bold: true,
				fontSize: 12,
				lineHeight: 1.8,
			},
			h4: {
				bold: true,
				lineHeight: 1.4,
			},
			footer: {
				fontSize: 9,
				bold: true,
			},
		},
	};
}
