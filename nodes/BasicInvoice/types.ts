export type Address = {
	street: string;
	zipCode: string;
	city: string;
};

export type Company = {
	label: string;
	legalForm: string;
	siret: string;
	ape: string;
	email: string;
	address: Address;
	cachet: {
		mimeType: string;
		base64: string;
	};
};

export type Person = {
	name: string;
	email?: string;
	address?: Address;
	nationalNumber?: string;
};

export type InvoiceLine = {
	description: string;
	quantity: number;
	unitPrice: number;
	vatRate: number;
};

export type InvoiceParams = {
	id: string;
	date: string;
	title: string;
	from: Company;
	client: Person | Company;
	lines: InvoiceLine[];
	isPaid: boolean;
	noVat: boolean;
	footerDetails?: string;
};
