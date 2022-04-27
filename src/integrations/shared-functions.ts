/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { ActionsType, Participant } from '../types/participant';
import { MAIL_APP_ID, MAILS_ROUTE } from '../constants';

export const mailToSharedFunction: (contacts: Array<Partial<Participant>>) => void = (contacts) => {
	getBridgedFunctions().addBoard(`${MAILS_ROUTE}/new?action=mailTo`, {
		app: MAIL_APP_ID,
		contacts
	});
};

export const openComposerSharedFunction: (
	onConfirm: any,
	compositionData: any,
	...rest: any[]
) => void = (onConfirm, compositionData, ...rest) => {
	getBridgedFunctions().addBoard(`${MAILS_ROUTE}/new?action=compose`, {
		app: MAIL_APP_ID,
		onConfirm,
		compositionData,
		...rest
	});
};

export const openPrefilledComposerSharedFunction: (compositionData: any, ...rest: any) => void = (
	compositionData,
	...rest
) => {
	const attach =
		compositionData?.aid?.length > 0
			? { attach: { aid: compositionData?.aid?.join(',') } }
			: undefined;
	const editor = { compositionData, ...attach };
	getBridgedFunctions().addBoard(`${MAILS_ROUTE}/new?action=${ActionsType.PREFILL_COMPOSE}`, {
		app: MAIL_APP_ID,
		compositionData: editor,
		...rest
	});
};
