import { InvoiceLine } from './types';

export function getVAT(line: InvoiceLine) {
	return line.unitPrice * line.quantity * line.vatRate;
}

export function getVATTotal(lines: InvoiceLine[]) {
	return lines.reduce((sum, line) => sum + getVAT(line), 0);
}

export function getNet(line: InvoiceLine) {
	return line.unitPrice * line.quantity;
}

export function getNetTotal(lines: InvoiceLine[]) {
	return lines.reduce((sum, line) => sum + getNet(line), 0);
}

export function getGross(line: InvoiceLine) {
	return getNet(line) + getVAT(line);
}

export function getGrossTotal(lines: InvoiceLine[]) {
	return lines.reduce((sum, line) => sum + getGross(line), 0);
}
