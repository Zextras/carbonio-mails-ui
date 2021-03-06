/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { normalizeMailMessageFromSoap } from '../../normalizations/normalize-message';
import { GetMsgForPrintParameter, MailMessage } from '../../types';

export const getMsgsForPrint = async ({ ids }: GetMsgForPrintParameter): Promise<any> => {
	const { GetMsgResponse } = await soapFetch('Batch', {
		GetMsgRequest: map(ids, (id) => ({
			m: {
				html: 1,
				id,
				needExp: 1
			},
			_jsns: 'urn:zimbraMail'
		})),
		_jsns: 'urn:zimbra'
	});
	const groupedMsgs = map(GetMsgResponse, (re) => {
		const msg = re.m[0];
		return normalizeMailMessageFromSoap(msg, true) as MailMessage;
	});
	return groupedMsgs;
};
